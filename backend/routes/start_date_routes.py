import logging
from fastapi import APIRouter, Request, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from session.session_layer import validate_session
from slowapi import Limiter
from slowapi.util import get_remote_address
import database
from db.users import Users
from db import processing_tasks as task_models
from datetime import datetime, timezone, timedelta
from sqlmodel import select
from utils.auth_utils import AuthenticatedUser
from utils.billing_utils import is_premium_eligible
from utils.credential_service import load_credentials
from utils.tier_limits import FREE_HISTORY_DAYS
from routes.email_routes import fetch_emails_to_db

limiter = Limiter(key_func=get_remote_address)

# Logger setup
logger = logging.getLogger(__name__)

# FastAPI router for email routes
router = APIRouter()

class StartDatePreset(str, Enum):
    ONE_WEEK = "1_week"
    ONE_MONTH = "1_month"
    THREE_MONTHS = "3_months"
    SIX_MONTHS = "6_months"
    CUSTOM = "custom"


PRESET_DAYS = {
    StartDatePreset.ONE_WEEK: 7,
    StartDatePreset.ONE_MONTH: 30,
    StartDatePreset.THREE_MONTHS: 90,
    StartDatePreset.SIX_MONTHS: 180,
}


class UpdateStartDateRequest(BaseModel):
    preset: StartDatePreset
    custom_date: Optional[str] = None
    fetch_order: str = "recent_first"   # "recent_first" | "oldest_first"
    end_date: Optional[datetime] = None  # None = no upper bound


@router.get("/settings/start-date")
@limiter.limit("20/minute")
async def get_start_date(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session),
):
    """Get user's current job search start date."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "start_date": user.start_date.isoformat() if user.start_date else None
    }


@router.put("/settings/start-date")
@limiter.limit("5/minute")
async def update_start_date(
    request: Request,
    start_date_request: UpdateStartDateRequest,
    background_tasks: BackgroundTasks,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session),
):
    """Update start date and trigger rescan.

    Returns 401 if the user's OAuth token has expired.
    Returns 200 with the new start date and rescan_started flag.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    should_auto_refresh = is_premium_eligible(db_session, user) if user else False
    
    creds = load_credentials(db_session, user_id, credential_type="primary", auto_refresh=should_auto_refresh)
    if not creds:
        raise HTTPException(status_code=401, detail="token_expired")

    # Calculate new start date
    if start_date_request.preset == StartDatePreset.CUSTOM:
        if not start_date_request.custom_date:
            raise HTTPException(
                status_code=400,
                detail="custom_date required when preset is 'custom'"
            )
        try:
            start_date = datetime.fromisoformat(start_date_request.custom_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use ISO format: YYYY-MM-DD"
            )
    else:
        days_ago = PRESET_DAYS.get(start_date_request.preset, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days_ago)

    # Update user's start date and scan preferences
    user.start_date = start_date
    user.fetch_order = start_date_request.fetch_order
    is_promo_coach = user.role == "coach" and user.plan == "promo"
    if is_promo_coach:
        # Promo coach: use the full selected range
        user.scan_end_date = start_date_request.end_date
    elif user.role == "coach":
        # Free coach: cap scan to start_date + 30 days
        user.scan_end_date = start_date + timedelta(days=FREE_HISTORY_DAYS)
    else:
        user.scan_end_date = start_date_request.end_date
    db_session.add(user)
    db_session.commit()

    # Update session
    request.session["start_date"] = start_date.strftime("%Y/%m/%d")
    request.session["start_date_updated"] = True

    logger.info(f"user_id:{user_id} updated start date to {start_date.isoformat()}")

    # Check if already processing
    active_task = db_session.exec(
        select(task_models.TaskRuns)
        .where(task_models.TaskRuns.user_id == user_id)
        .where(task_models.TaskRuns.status == task_models.STARTED)
    ).first()

    rescan_started = False
    if not active_task:
        # Determine the effective scan start date based on plan/role:
        # - Coach with promo: use the selected start_date (full range backfill)
        # - All others (job seekers and free coaches): scan last 30 days from today
        #   (start_date is only a dashboard view filter, not a backfill scope)
        if user.role == "coach":
            # Coaches always scan from their selected start date.
            # Promo unlocks full dashboard visibility; free coaches see only the
            # first 30 days of their range in the dashboard but we still scan it all.
            effective_scan_start = start_date
        else:
            # Job seekers: start_date is a dashboard view filter only;
            # always scan the rolling last-30-days window.
            effective_scan_start = datetime.now(timezone.utc) - timedelta(days=FREE_HISTORY_DAYS)

        try:
            # Prefer email_sync credentials for Gmail access; fall back to primary
            scan_creds = load_credentials(db_session, user_id, credential_type="email_sync", auto_refresh=should_auto_refresh) or creds
            auth_user = AuthenticatedUser(
                scan_creds,
                _user_id=user.user_id,
                _user_email=user.user_email
            )

            background_tasks.add_task(
                fetch_emails_to_db,
                auth_user,
                request,
                None,  # Force full re-scan from start_date (already set in session/DB)
                user_id=user_id,
                quick_limit=5,  # Show first 5 fast; dashboard triggers full scan via should_rescan
            )
            rescan_started = True
            logger.info(f"Rescan started for user {user_id} (scan_start={effective_scan_start.isoformat()}, plan={user.plan})")
        except Exception as e:
            logger.error(f"Error starting rescan for user {user_id}: {e}")

    return {
        "start_date": start_date.isoformat(),
        "rescan_started": rescan_started
    }