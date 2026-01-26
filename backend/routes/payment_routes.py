import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlmodel import select
import stripe

from db.users import Users, CoachClientLink
from db.payment_asks import PaymentAsks
from db.processing_tasks import TaskRuns, FINISHED
from session.session_layer import validate_session
from utils.config_utils import get_settings, get_stripe_key
import database
from slowapi import Limiter
from slowapi.util import get_remote_address

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# Request/Response models
class ShouldAskResponse(BaseModel):
    should_ask: bool
    trigger_type: Optional[str] = None
    trigger_value: Optional[str] = None
    suggested_amount_cents: int = 1000  # Default to $10
    reason: Optional[str] = None


class AskShownRequest(BaseModel):
    trigger_type: str
    trigger_value: Optional[str] = None


class AskActionRequest(BaseModel):
    action: str  # 'skipped', 'maybe_later', 'selected'
    selected_amount_cents: Optional[int] = None


class CheckoutRequest(BaseModel):
    amount_cents: int
    trigger_type: Optional[str] = None
    is_recurring: bool = True  # Default to recurring for backwards compatibility


class PaymentStatusResponse(BaseModel):
    is_contributor: bool
    monthly_cents: int
    started_at: Optional[str] = None
    total_contributed_cents: int
    stripe_subscription_id: Optional[str] = None


class UpdateSubscriptionRequest(BaseModel):
    new_amount_cents: int


@router.get("/payment/should-ask", response_model=ShouldAskResponse)
@limiter.limit("20/minute")
async def should_show_payment_ask(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Determine if we should show the payment ask modal."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        return ShouldAskResponse(should_ask=False, reason="user_not_found")

    # Already contributing
    if (user.monthly_contribution_cents or 0) > 0:
        return ShouldAskResponse(should_ask=False, reason="already_contributing")

    # Check if user has an active coach link (coach is paying for their seat)
    active_coach_link = db_session.exec(
        select(CoachClientLink)
        .where(CoachClientLink.client_id == user_id)
        .where(CoachClientLink.end_date.is_(None))
    ).first()
    if active_coach_link:
        return ShouldAskResponse(should_ask=False, reason="has_active_coach")

    # Check recent asks
    recent_ask = db_session.exec(
        select(PaymentAsks)
        .where(PaymentAsks.user_id == user_id)
        .where(PaymentAsks.action_at.isnot(None))
        .order_by(PaymentAsks.shown_at.desc())
    ).first()

    if recent_ask:
        days_since_ask = (datetime.now(timezone.utc) - recent_ask.action_at).days if recent_ask.action_at else 0

        # If they selected an amount and went to checkout, don't ask again
        # This covers the case where webhook hasn't processed yet
        if recent_ask.action == 'selected' and (recent_ask.selected_amount_cents or 0) > 0:
            return ShouldAskResponse(should_ask=False, reason="already_submitted_payment")

        # If they chose $0 recently, wait 90 days
        if recent_ask.selected_amount_cents == 0 and days_since_ask < 90:
            return ShouldAskResponse(should_ask=False, reason="chose_zero_recently")

        # If they said maybe later, wait 30 days
        if recent_ask.action == 'maybe_later' and days_since_ask < 30:
            return ShouldAskResponse(should_ask=False, reason="asked_recently")

    # Check if processing has completed (trigger: post_processing)
    completed_task = db_session.exec(
        select(TaskRuns)
        .where(TaskRuns.user_id == user_id)
        .where(TaskRuns.status == FINISHED)
        .order_by(TaskRuns.updated.desc())
    ).first()

    if completed_task:
        return ShouldAskResponse(
            should_ask=True,
            trigger_type="post_processing",
            trigger_value=str(completed_task.processed_emails or 0),
            suggested_amount_cents=1000
        )

    return ShouldAskResponse(should_ask=False, reason="no_trigger_met")


@router.post("/payment/ask-shown")
@limiter.limit("10/minute")
async def record_ask_shown(
    request: Request,
    body: AskShownRequest,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Record that payment ask was shown."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    ask = PaymentAsks(
        user_id=user_id,
        trigger_type=body.trigger_type,
        trigger_value=body.trigger_value
    )
    db_session.add(ask)
    db_session.commit()
    db_session.refresh(ask)

    logger.info(f"Payment ask shown to user {user_id}, trigger: {body.trigger_type}")
    return {"recorded": True, "ask_id": str(ask.id)}


@router.post("/payment/ask-action")
@limiter.limit("10/minute")
async def record_ask_action(
    request: Request,
    body: AskActionRequest,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Record user's response to payment ask."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Find most recent ask for this user
    ask = db_session.exec(
        select(PaymentAsks)
        .where(PaymentAsks.user_id == user_id)
        .order_by(PaymentAsks.shown_at.desc())
    ).first()

    if ask:
        ask.action = body.action
        ask.selected_amount_cents = body.selected_amount_cents
        ask.action_at = datetime.now(timezone.utc)
        db_session.add(ask)
        db_session.commit()
        logger.info(f"Payment ask action recorded for user {user_id}: {body.action}, amount: {body.selected_amount_cents}")

    return {"recorded": True}


@router.post("/payment/checkout")
@limiter.limit("10/minute")
async def create_checkout(
    request: Request,
    body: CheckoutRequest,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Create Stripe checkout session for chosen contribution amount."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    get_stripe_key()

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.amount_cents < 100:
        raise HTTPException(status_code=400, detail="Minimum contribution is $1")

    try:
        # Create or get Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.user_email,
                metadata={"user_id": user_id}
            )
            user.stripe_customer_id = customer.id
            db_session.add(user)
            db_session.commit()

        # Build checkout session based on payment type
        if body.is_recurring:
            # Recurring subscription
            checkout_session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                mode="subscription",
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": body.amount_cents,
                        "recurring": {"interval": "month"},
                        "product_data": {"name": "JustAJobApp Monthly Contribution"}
                    },
                    "quantity": 1
                }],
                success_url=f"{settings.APP_URL}/payment/thank-you?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.APP_URL}/dashboard",
                metadata={
                    "user_id": user_id,
                    "amount_cents": str(body.amount_cents),
                    "trigger_type": body.trigger_type or "manual",
                    "is_recurring": "true"
                },
                subscription_data={
                    "metadata": {
                        "user_id": user_id,
                        "amount_cents": str(body.amount_cents)
                    }
                }
            )
        else:
            # One-time payment
            checkout_session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                mode="payment",
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": body.amount_cents,
                        "product_data": {"name": "JustAJobApp One-Time Contribution"}
                    },
                    "quantity": 1
                }],
                success_url=f"{settings.APP_URL}/payment/thank-you?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.APP_URL}/dashboard",
                metadata={
                    "user_id": user_id,
                    "amount_cents": str(body.amount_cents),
                    "trigger_type": body.trigger_type or "manual",
                    "is_recurring": "false"
                }
            )

        payment_type = "recurring" if body.is_recurring else "one-time"
        logger.info(f"Created {payment_type} checkout session {checkout_session.id} for user {user_id}, amount: {body.amount_cents}")
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.get("/payment/status", response_model=PaymentStatusResponse)
@limiter.limit("20/minute")
async def get_payment_status(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Get user's contribution status."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return PaymentStatusResponse(
        is_contributor=(user.monthly_contribution_cents or 0) > 0,
        monthly_cents=user.monthly_contribution_cents or 0,
        started_at=user.contribution_started_at.isoformat() if user.contribution_started_at else None,
        total_contributed_cents=user.total_contributed_cents or 0,
        stripe_subscription_id=user.stripe_subscription_id
    )


@router.post("/payment/cancel")
@limiter.limit("5/minute")
async def cancel_contribution(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Cancel contribution subscription."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    get_stripe_key()

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user or not user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription")

    try:
        stripe.Subscription.cancel(user.stripe_subscription_id)

        # Update user record
        user.monthly_contribution_cents = 0
        user.stripe_subscription_id = None
        db_session.add(user)
        db_session.commit()

        logger.info(f"Contribution cancelled for user {user_id}")
        return {"cancelled": True}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe cancellation error: {e}")
        raise HTTPException(status_code=500, detail="Could not cancel subscription")


@router.post("/payment/update-subscription")
@limiter.limit("5/minute")
async def update_subscription(
    request: Request,
    body: UpdateSubscriptionRequest,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Update subscription amount."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if body.new_amount_cents < 100:
        raise HTTPException(status_code=400, detail="Minimum contribution is $1")

    get_stripe_key()

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user or not user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription")

    try:
        # Retrieve the current subscription to get the item ID
        subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
        if not subscription.get("items") or not subscription["items"].get("data"):
            raise HTTPException(status_code=400, detail="Invalid subscription state")

        subscription_item_id = subscription["items"]["data"][0]["id"]

        # Update the subscription with a new price
        updated_subscription = stripe.Subscription.modify(
            user.stripe_subscription_id,
            items=[{
                "id": subscription_item_id,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": body.new_amount_cents,
                    "recurring": {"interval": "month"},
                    "product_data": {"name": "JustAJobApp Monthly Contribution"}
                }
            }],
            proration_behavior="none"  # Don't prorate, just change from next billing
        )

        # Update user record
        user.monthly_contribution_cents = body.new_amount_cents
        db_session.add(user)
        db_session.commit()

        logger.info(f"Subscription updated for user {user_id}: ${body.new_amount_cents/100:.2f}/mo")
        return {
            "updated": True,
            "new_amount_cents": body.new_amount_cents
        }

    except stripe.error.StripeError as e:
        logger.error(f"Stripe update error: {e}")
        raise HTTPException(status_code=500, detail="Could not update subscription")
