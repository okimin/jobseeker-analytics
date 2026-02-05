import logging
from typing import Optional

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlmodel import select
import stripe

from db.users import Users
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
class CheckoutRequest(BaseModel):
    amount_cents: int
    trigger_type: Optional[str] = None
    is_recurring: bool = True  # Default to recurring for backwards compatibility


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
        # Verify subscription ownership before cancelling
        subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
        subscription_user_id = subscription.get("metadata", {}).get("user_id")
        if subscription_user_id != user_id:
            logger.error(f"Subscription ownership mismatch: expected {user_id}, got {subscription_user_id}")
            raise HTTPException(status_code=403, detail="Subscription does not belong to user")

        # Cancel at period end so user keeps benefits until billing cycle ends
        updated_subscription = stripe.Subscription.modify(
            user.stripe_subscription_id,
            cancel_at_period_end=True
        )

        # Don't clear monthly_contribution_cents yet - webhook will handle that
        # when subscription actually ends
        period_end = updated_subscription.get("current_period_end")

        logger.info(f"Contribution scheduled for cancellation for user {user_id}, ends at {period_end}")
        return {
            "cancelled": True,
            "cancel_at_period_end": True,
            "period_end_timestamp": period_end
        }

    except stripe.error.StripeError as e:
        logger.error(f"Stripe cancellation error: {e}")
        raise HTTPException(status_code=500, detail="Could not cancel subscription")
