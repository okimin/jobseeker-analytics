import logging
import json
from fastapi import APIRouter, Request, Form, Depends, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
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
from google.oauth2.credentials import Credentials
from utils.auth_utils import AuthenticatedUser
from routes.email_routes import fetch_emails_to_db

limiter = Limiter(key_func=get_remote_address)

# Logger setup
logger = logging.getLogger(__name__)

api_call_finished = False

# FastAPI router for email routes
router = APIRouter()

@router.post("/set-start-date")
@limiter.limit("5/minute")
async def set_start_date(request: Request, db_session: database.DBSession, start_date: str = Form(...), user_id: str = Depends(validate_session)):
    """Updates the user's job search start date in the database."""
    if not user_id:
        return HTMLResponse(content="Invalid request. Please log in again.", status_code=400)

    try:
        # Fetch user from DB
        user_record = db_session.get(Users, user_id)
        if not user_record:
             return HTMLResponse(content="User not found.", status_code=404)
        
        # Update start date in DB
        # Convert the string to a timezone-aware datetime object (UTC)
        parsed_start_date = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        user_record.start_date = parsed_start_date
        db_session.add(user_record)
        db_session.commit()

        # Update session
        request.session["start_date"] = parsed_start_date.strftime("%Y/%m/%d")
        request.session["is_new_user"] = False
        request.session["start_date_updated"] = True

        logger.info(f"user_id:{user_id} updated start date to {start_date}")

        return JSONResponse(content={"message": "Start date updated successfully"}, status_code=200)
    except Exception as e:
        logger.error(f"Error setting start date: {e}")
        return HTMLResponse(content="Failed to save start date. Try again.", status_code=500)
    

@router.get("/api/session-data")
@limiter.limit("5/minute")
async def get_session_data(request: Request, user_id: str = Depends(validate_session)):
    """Fetches session data for the user."""
    
    user_id = request.session.get("user_id")
    token_expiry = request.session.get("token_expiry")
    session_id = request.session.get("session_id")
    is_new_user = request.session.get("is_new_user", False)

    logger.info(f"Fetching session data: user_id={user_id}, session_id={session_id}")

    if not user_id:
        logger.warning("Session data missing user_id. Possible expired or invalid session.")
        return JSONResponse(content={"error": "Session expired or invalid"}, status_code=401)

    session_data = {
        "user_id": user_id,
        "token_expiry": token_expiry,
        "session_id": session_id,
        "is_new_user": is_new_user,
    }

    logger.info(f"Session data being returned: {session_data}")

    return JSONResponse(content=session_data)


class StartDatePreset(str, Enum):
    ONE_WEEK = "1_week"
    ONE_MONTH = "1_month"
    THREE_MONTHS = "3_months"
    CUSTOM = "custom"


PRESET_DAYS = {
    StartDatePreset.ONE_WEEK: 7,
    StartDatePreset.ONE_MONTH: 30,
    StartDatePreset.THREE_MONTHS: 90,
}


class UpdateStartDateRequest(BaseModel):
    preset: StartDatePreset
    custom_date: Optional[str] = None


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

    # Check if credentials are valid for rescan
    creds_json = request.session.get("creds")
    if not creds_json:
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

    # Update user's start date
    user.start_date = start_date
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
        # Start background processing with new date
        try:
            creds_dict = json.loads(creds_json)
            creds = Credentials.from_authorized_user_info(creds_dict)
            auth_user = AuthenticatedUser(creds)

            # Use the new start date for fetching
            background_tasks.add_task(
                fetch_emails_to_db,
                auth_user,
                request,
                start_date,  # Use the new start date
                user_id=user_id
            )
            rescan_started = True
            logger.info(f"Rescan started for user {user_id} with new start date")
        except Exception as e:
            logger.error(f"Error starting rescan for user {user_id}: {e}")

    return {
        "start_date": start_date.isoformat(),
        "rescan_started": rescan_started
    }