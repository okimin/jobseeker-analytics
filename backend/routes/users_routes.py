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
from utils.config_utils import get_stripe_key
import stripe

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
    has_active_subscription: bool
    has_valid_credentials: bool
    last_background_sync_at: Optional[str]
    contribution_started_at: Optional[str]
    cancel_at_period_end: bool = False
    subscription_ends_at: Optional[int] = None  # Unix timestamp when cancelled
    subscription_renews_at: Optional[int] = None  # Unix timestamp for next renewal
    emails_processed_this_month: int = 0
    monthly_email_cap: int
    monthly_reset_date: Optional[str] = None  # ISO date of next reset (1st of next month)


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

    # Check Stripe subscription status for cancellation and renewal info
    cancel_at_period_end = False
    subscription_ends_at = None
    subscription_renews_at = None
    if user.stripe_subscription_id:
        try:
            get_stripe_key()
            subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
            cancel_at_period_end = subscription.get("cancel_at_period_end", False)
            if cancel_at_period_end:
                subscription_ends_at = subscription.get("cancel_at")
            # Get renewal date from subscription items (current_period_end moved here in newer Stripe API)
            items = subscription.get("items", {})
            items_data = items.get("data", [])
            if items_data:
                subscription_renews_at = items_data[0].get("current_period_end")
        except stripe.error.StripeError as e:
            logger.warning(f"Failed to fetch subscription status: {e}")

    from utils.billing_utils import get_monthly_email_cap, reset_monthly_counter_if_needed
    from datetime import date
    import calendar

    # Reset counter if we've rolled into a new calendar month, then persist
    user = reset_monthly_counter_if_needed(user)
    db_session.add(user)
    db_session.commit()

    monthly_cap = get_monthly_email_cap(db_session, user)
    emails_processed = user.emails_processed_this_month or 0

    # Next reset = 1st of next month
    today = date.today()
    if today.month == 12:
        next_reset = date(today.year + 1, 1, 1)
    else:
        next_reset = date(today.year, today.month + 1, 1)

    return PremiumStatusResponse(
        is_premium=is_premium,
        premium_reason=premium_reason,
        monthly_contribution_cents=user.monthly_contribution_cents,
        has_active_subscription=user.stripe_subscription_id is not None,
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
        cancel_at_period_end=cancel_at_period_end,
        subscription_ends_at=subscription_ends_at,
        subscription_renews_at=subscription_renews_at,
        emails_processed_this_month=emails_processed,
        monthly_email_cap=monthly_cap,
        monthly_reset_date=next_reset.isoformat(),
    )
