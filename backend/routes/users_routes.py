import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

import database
from db.users import Users
from session.session_layer import validate_session
from utils.credential_service import load_credentials
from utils.billing_utils import get_premium_reason

# Logger setup
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

# FastAPI router for user routes
router = APIRouter()


class PremiumStatusResponse(BaseModel):
    """Unified premium status for frontend settings modal."""

    is_premium: bool
    premium_reason: Optional[str]  # "coach", "coach_client", "paid", or None
    monthly_contribution_cents: int
    stripe_subscription_id: Optional[str]
    has_valid_credentials: bool
    last_background_sync_at: Optional[str]
    contribution_started_at: Optional[str]


@router.get("/settings/premium-status")
@limiter.limit("20/minute")
async def get_premium_status(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session),
) -> PremiumStatusResponse:
    """Get unified premium status for settings modal.

    Combines subscription info and background sync status in one endpoint.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user has valid OAuth credentials stored
    creds = load_credentials(db_session, user_id, "email_sync", auto_refresh=False)
    if not creds:
        creds = load_credentials(db_session, user_id, "primary", auto_refresh=False)
    has_valid_credentials = creds is not None

    # Get premium reason
    premium_reason = get_premium_reason(db_session, user)
    is_premium = premium_reason is not None

    return PremiumStatusResponse(
        is_premium=is_premium,
        premium_reason=premium_reason,
        monthly_contribution_cents=user.monthly_contribution_cents,
        stripe_subscription_id=user.stripe_subscription_id,
        has_valid_credentials=has_valid_credentials,
        last_background_sync_at=(
            user.last_background_sync_at.isoformat()
            if user.last_background_sync_at
            else None
        ),
        contribution_started_at=(
            user.contribution_started_at.isoformat()
            if user.contribution_started_at
            else None
        ),
    )
