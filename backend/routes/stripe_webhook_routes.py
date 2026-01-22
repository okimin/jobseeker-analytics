import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Request, HTTPException, Header
from sqlmodel import select
import stripe
from slowapi import Limiter
from slowapi.util import get_remote_address

from db.users import Users
from db.contributions import Contributions
from utils.config_utils import get_settings, get_stripe_key
import database

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/stripe/webhook")
@limiter.limit("100/minute")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """Handle Stripe webhook events."""
    get_stripe_key()
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        tier = metadata.get("tier")  # Legacy field for old pricing
        amount_cents_str = metadata.get("amount_cents")  # New field for choose-your-price
        payment_intent_id = session.get("payment_intent")

        if not user_id:
            logger.error(f"Missing user_id in checkout session: {session.get('id')}")
            return {"status": "error", "message": "Missing user_id"}

        with database.get_session() as db_session:
            # Idempotency check: skip if we've already processed this payment_intent
            if payment_intent_id:
                existing = db_session.exec(
                    select(Contributions).where(
                        Contributions.stripe_payment_intent_id == payment_intent_id
                    )
                ).first()
                if existing:
                    logger.info(f"Duplicate webhook for payment_intent {payment_intent_id}, skipping")
                    return {"status": "success", "message": "Already processed"}

            user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
            if user:
                subscription_id = session.get("subscription")
                amount_total = session.get("amount_total", 0)

                # Determine amount - prefer explicit amount_cents, fall back to amount_total
                amount_cents = int(amount_cents_str) if amount_cents_str else amount_total

                # Update user with contribution info
                user.monthly_contribution_cents = amount_cents
                user.stripe_subscription_id = subscription_id
                if not user.contribution_started_at:
                    user.contribution_started_at = datetime.now(timezone.utc)
                user.total_contributed_cents = (user.total_contributed_cents or 0) + amount_cents

                # Legacy: Keep has_completed_onboarding and subscription_tier for backwards compat
                user.has_completed_onboarding = True
                if tier:
                    user.subscription_tier = tier
                elif amount_cents > 0:
                    # Map amount to a tier label for legacy compatibility
                    if amount_cents <= 500:
                        user.subscription_tier = "standard"
                    elif amount_cents <= 1500:
                        user.subscription_tier = "standard"
                    else:
                        user.subscription_tier = "sustainer"

                db_session.add(user)

                # Create contribution record with payment_intent_id for idempotency
                contribution = Contributions(
                    user_id=user_id,
                    stripe_payment_intent_id=payment_intent_id,
                    stripe_subscription_id=subscription_id,
                    amount_cents=amount_cents,
                    is_recurring=True,
                    status="completed",
                    trigger_type=metadata.get("trigger_type")
                )
                db_session.add(contribution)
                db_session.commit()

                logger.info(f"User {user_id} started contributing ${amount_cents/100:.2f}/month")
            else:
                logger.error(f"User {user_id} not found for checkout session")

    # Handle invoice.paid for recurring payments
    elif event["type"] == "invoice.paid":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        amount_paid = invoice.get("amount_paid", 0)
        payment_intent_id = invoice.get("payment_intent")

        # Skip the first invoice (already handled by checkout.session.completed)
        billing_reason = invoice.get("billing_reason")
        if billing_reason == "subscription_create":
            logger.info(f"Skipping initial invoice for subscription {subscription_id}")
            return {"status": "success"}

        if subscription_id and amount_paid > 0:
            with database.get_session() as db_session:
                # Idempotency check: skip if we've already processed this payment_intent
                if payment_intent_id:
                    existing = db_session.exec(
                        select(Contributions).where(
                            Contributions.stripe_payment_intent_id == payment_intent_id
                        )
                    ).first()
                    if existing:
                        logger.info(f"Duplicate invoice webhook for payment_intent {payment_intent_id}, skipping")
                        return {"status": "success", "message": "Already processed"}

                user = db_session.exec(
                    select(Users).where(Users.stripe_subscription_id == subscription_id)
                ).first()

                if user:
                    user.total_contributed_cents = (user.total_contributed_cents or 0) + amount_paid
                    db_session.add(user)

                    # Create contribution record for recurring payment with payment_intent_id for idempotency
                    contribution = Contributions(
                        user_id=user.user_id,
                        stripe_payment_intent_id=payment_intent_id,
                        stripe_subscription_id=subscription_id,
                        amount_cents=amount_paid,
                        is_recurring=True,
                        status="completed"
                    )
                    db_session.add(contribution)
                    db_session.commit()

                    logger.info(f"Recurring payment recorded for user {user.user_id}: ${amount_paid/100:.2f}")

    # Handle subscription cancellation
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        subscription_id = subscription["id"]

        with database.get_session() as db_session:
            user = db_session.exec(
                select(Users).where(Users.stripe_subscription_id == subscription_id)
            ).first()

            if user:
                user.monthly_contribution_cents = 0
                user.stripe_subscription_id = None
                db_session.add(user)
                db_session.commit()

                logger.info(f"Subscription cancelled for user {user.user_id}")

    return {"status": "success"}
