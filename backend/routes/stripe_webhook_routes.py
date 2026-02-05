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
from utils.billing_utils import (
    upgrade_user_to_premium,
    downgrade_user_from_premium,
    PREMIUM_CONTRIBUTION_THRESHOLD_CENTS,
)
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
    if not stripe_signature:
        logger.error("Missing Stripe-Signature header")
        raise HTTPException(status_code=400, detail="Missing signature header")

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

    logger.info(f"Received Stripe webhook event: {event['type']}")

    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        amount_cents_str = metadata.get("amount_cents")
        payment_intent_id = session.get("payment_intent")

        logger.info(f"checkout.session.completed - user_id: {user_id}, amount: {amount_cents_str}, subscription: {session.get('subscription')}")

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
                is_recurring = metadata.get("is_recurring", "true") == "true"

                # Determine amount - prefer explicit amount_cents, fall back to amount_total
                amount_cents = int(amount_cents_str) if amount_cents_str else amount_total

                # Update user with contribution info
                if is_recurring:
                    # Recurring: set monthly contribution and subscription
                    user.monthly_contribution_cents = amount_cents
                    user.stripe_subscription_id = subscription_id
                # One-time payments don't set monthly_contribution_cents

                if not user.contribution_started_at:
                    user.contribution_started_at = datetime.now(timezone.utc)
                user.total_contributed_cents = (user.total_contributed_cents or 0) + amount_cents

                if user.onboarding_completed_at is None:
                    user.onboarding_completed_at = datetime.now(timezone.utc)
                db_session.add(user)

                # Create contribution record with payment_intent_id for idempotency
                contribution = Contributions(
                    user_id=user_id,
                    stripe_payment_intent_id=payment_intent_id,
                    stripe_subscription_id=subscription_id if is_recurring else None,
                    amount_cents=amount_cents,
                    is_recurring=is_recurring,
                    status="completed",
                    trigger_type=metadata.get("trigger_type")
                )
                db_session.add(contribution)
                db_session.commit()

                # Upgrade to premium tier if recurring $5+/month contribution
                if is_recurring and amount_cents >= PREMIUM_CONTRIBUTION_THRESHOLD_CENTS:
                    upgrade_user_to_premium(db_session, user_id)

                payment_type = "monthly" if is_recurring else "one-time"
                logger.info(f"User {user_id} made {payment_type} contribution of ${amount_cents/100:.2f}")
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

                # Check if user should be downgraded from premium tier
                downgrade_user_from_premium(db_session, user.user_id)

                logger.info(f"Subscription cancelled for user {user.user_id}")

    # Handle subscription updates (amount changes from Stripe dashboard or API)
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        subscription_id = subscription["id"]

        # Get the new amount from the subscription items
        items = subscription.get("items", {}).get("data", [])
        if items:
            new_amount = items[0].get("price", {}).get("unit_amount", 0)

            with database.get_session() as db_session:
                user = db_session.exec(
                    select(Users).where(Users.stripe_subscription_id == subscription_id)
                ).first()

                if user and new_amount > 0:
                    old_amount = user.monthly_contribution_cents or 0
                    user.monthly_contribution_cents = new_amount
                    db_session.add(user)
                    db_session.commit()

                    # Check for tier upgrade/downgrade based on new amount
                    if new_amount >= PREMIUM_CONTRIBUTION_THRESHOLD_CENTS and old_amount < PREMIUM_CONTRIBUTION_THRESHOLD_CENTS:
                        upgrade_user_to_premium(db_session, user.user_id)
                    elif new_amount < PREMIUM_CONTRIBUTION_THRESHOLD_CENTS and old_amount >= PREMIUM_CONTRIBUTION_THRESHOLD_CENTS:
                        downgrade_user_from_premium(db_session, user.user_id)

                    logger.info(f"Subscription amount updated for user {user.user_id}: ${new_amount/100:.2f}/mo")

    return {"status": "success"}
