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


class CheckoutSessionRequest(BaseModel):
    tier: str  # "standard", "sustainer", "custom"
    custom_amount: Optional[int] = None  # cents, for custom tier


class OnboardingStatusResponse(BaseModel):
    has_completed_onboarding: bool
    subscription_tier: Optional[str]
    has_email_sync_configured: bool
    sync_email_address: Optional[str]


class EmailSyncStatusResponse(BaseModel):
    has_email_sync_configured: bool
    sync_email_address: Optional[str]


@router.get("/api/users/onboarding-status", response_model=OnboardingStatusResponse)
@limiter.limit("10/minute")
async def get_onboarding_status(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Get the current user's onboarding status."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return OnboardingStatusResponse(
        has_completed_onboarding=user.has_completed_onboarding,
        subscription_tier=user.subscription_tier,
        has_email_sync_configured=user.has_email_sync_configured,
        sync_email_address=user.sync_email_address
    )


@router.get("/api/users/email-sync-status", response_model=EmailSyncStatusResponse)
@limiter.limit("10/minute")
async def get_email_sync_status(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Get the current user's email sync configuration status."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return EmailSyncStatusResponse(
        has_email_sync_configured=user.has_email_sync_configured,
        sync_email_address=user.sync_email_address
    )


@router.post("/api/users/complete-onboarding")
@limiter.limit("5/minute")
async def complete_onboarding_subsidized(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Complete onboarding for subsidized ($0) tier - no Stripe required."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.has_completed_onboarding:
        raise HTTPException(status_code=400, detail="Onboarding already completed")

    user.has_completed_onboarding = True
    user.subscription_tier = "subsidized"
    db_session.add(user)
    db_session.commit()

    logger.info(f"User {user_id} completed onboarding with subsidized tier")
    return {"message": "Onboarding completed", "tier": "subsidized"}


@router.post("/api/billing/create-checkout-session")
@limiter.limit("5/minute")
async def create_checkout_session(
    request: Request,
    body: CheckoutSessionRequest,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
):
    """Create Stripe checkout session for paid tiers."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    get_stripe_key()

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine price based on tier
    if body.tier == "standard":
        line_items = [{
            "price": settings.STRIPE_PRICE_ID_STANDARD,
            "quantity": 1
        }]
    elif body.tier == "sustainer":
        line_items = [{
            "price": settings.STRIPE_PRICE_ID_SUSTAINER,
            "quantity": 1
        }]
    elif body.tier == "custom":
        if not body.custom_amount or body.custom_amount < 100:  # min $1
            raise HTTPException(status_code=400, detail="Custom amount must be at least $1")
        line_items = [{
            "price_data": {
                "currency": "usd",
                "unit_amount": body.custom_amount,
                "recurring": {"interval": "month"},
                "product_data": {"name": "Custom Solidarity Tier"}
            },
            "quantity": 1
        }]
    else:
        raise HTTPException(status_code=400, detail="Invalid tier")

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

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            mode="subscription",
            line_items=line_items,
            success_url=f"{settings.APP_URL}/onboarding?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.APP_URL}/onboarding?canceled=true",
            metadata={
                "user_id": user_id,
                "tier": body.tier,
                "custom_amount": str(body.custom_amount) if body.custom_amount else ""
            }
        )

        logger.info(f"Created checkout session {checkout_session.id} for user {user_id}")
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")
