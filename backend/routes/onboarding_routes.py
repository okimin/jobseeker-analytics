import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from db.users import Users
from session.session_layer import validate_session
from utils.config_utils import get_settings
import database
from slowapi import Limiter
from slowapi.util import get_remote_address

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class OnboardingStatusResponse(BaseModel):
    has_completed_onboarding: bool  # Computed from onboarding_completed_at
    subscription_tier: Optional[str]
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
        has_completed_onboarding=user.onboarding_completed_at is not None,
        subscription_tier=user.subscription_tier,
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

    if user.onboarding_completed_at is not None:
        raise HTTPException(status_code=400, detail="Onboarding already completed")

    user.onboarding_completed_at = datetime.now(timezone.utc)
    user.subscription_tier = "subsidized"
    db_session.add(user)
    db_session.commit()

    logger.info(f"User {user_id} completed onboarding with subsidized tier")
    return {"message": "Onboarding completed", "tier": "subsidized"}
