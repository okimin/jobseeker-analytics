import logging
from fastapi import APIRouter, Request, HTTPException, Header
from sqlmodel import select
import stripe

from db.users import Users
from utils.config_utils import get_settings, get_stripe_key
import database

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/stripe/webhook")
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
        user_id = session.get("metadata", {}).get("user_id")
        tier = session.get("metadata", {}).get("tier")

        if not user_id or not tier:
            logger.error(f"Missing metadata in checkout session: {session.get('id')}")
            return {"status": "error", "message": "Missing metadata"}

        with database.get_session() as db_session:
            user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
            if user:
                user.has_completed_onboarding = True
                user.subscription_tier = tier
                db_session.add(user)
                db_session.commit()
                logger.info(f"User {user_id} completed onboarding via Stripe with tier {tier}")
            else:
                logger.error(f"User {user_id} not found for checkout session")

    return {"status": "success"}
