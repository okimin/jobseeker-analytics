import logging
from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from session.session_layer import validate_session
from slowapi import Limiter
from slowapi.util import get_remote_address
import database
from db.users import Users
from datetime import datetime

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
        user_record.start_date = datetime.strptime(start_date, "%Y-%m-%d")
        db_session.add(user_record)
        db_session.commit()

        # Update session
        request.session["start_date"] = start_date.replace("-", "/")
        request.session["is_new_user"] = False

        logger.info(f"user_id:{user_id} updated start date to {start_date}")

        return JSONResponse(content={"message": "Start date updated successfully"}, status_code=200)
    except Exception as e:
        logger.error(f"Error setting start date: {e}")
        return HTMLResponse(content="Failed to save start date. Try again.", status_code=500)
    
def get_start_date(request: Request, user_id: str = Depends(validate_session)) -> str:
    """Fetches the user's job search start date from the database."""
    # Query the database for the user's start date
    logger.info(f"Getting start date for user_id: {user_id}")
    return request.session.get("start_date")


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