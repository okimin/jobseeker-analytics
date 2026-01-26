# app/session/session_layer.py
import json
import logging
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import Request, Response
from utils.config_utils import get_settings
import database
from db.users import Users
from sqlmodel import select

logger = logging.getLogger(__name__)

settings = get_settings()

# Threshold for proactive token refresh (in minutes)
TOKEN_REFRESH_THRESHOLD_MINUTES = 5


def create_random_session_string() -> str:
    return secrets.token_urlsafe(32)  # Generates a random URL-safe string


def clear_session(request: Request, response: Response) -> None:
    logger.info("clear_session called")
    # 1. Clear the Starlette/FastAPI session storage
    request.session.clear() 

    # 2. Delete the primary auth cookies
    # We delete both the prefixed and non-prefixed versions to be safe 
    # across dev/prod environments
    response.delete_cookie(key="Authorization")
    response.delete_cookie(key="__Secure-Authorization", domain=settings.ORIGIN)
    response.delete_cookie(key="__Host-Authorization")
    
    # 3. Also clear the SessionMiddleware cookie itself
    response.delete_cookie(key="session", domain=settings.ORIGIN)

    logger.warning("Session and cookies cleared for security.")

def validate_session(request: Request, db_session: database.DBSession) -> str:
    """Retrieves Authorization, session_id, access_token and token_expiry
    from request cookies and validates them.
    Session ID should match the stored session.
    Access token should not be expired.
    """
    if settings.is_publicly_deployed:
        session_authorization = request.cookies.get("__Secure-Authorization")
    else:
        session_authorization = request.cookies.get("Authorization")

    session_id = request.session.get("session_id")
    session_access_token = request.session.get("access_token")
    token_exp = request.session.get("token_expiry")
    user_id = request.session.get("user_id")
    user_email = request.session.get("user_email")

    if not session_authorization and not session_access_token:
        logger.info(
            "No Authorization and access_token in session, redirecting to login"
        )
        return ""

    if session_authorization != session_id:
        logger.info("Authorization does not match Session Id, redirecting to login")
        return ""

    if is_token_expired(token_exp) or is_token_near_expiry(token_exp):
        logger.info("Access_token expired or near expiry, attempting refresh")
        if user_id and attempt_token_refresh(request, db_session, user_id):
            logger.info("Token refresh succeeded for user %s", user_id)
            # Continue with validation - token is now valid
        else:
            logger.info("Token refresh failed, redirecting to login")
            return ""

    if user_id:
        # check that user actually exists in database first
        logger.info("validate_session found user_id: %s", user_id)
        db_session.expire_all()  # Clear any cached data
        db_session.commit()  # Commit pending changes to ensure the database is in latest state
        user = db_session.exec(select(Users).where(Users.user_email == user_email)).first()
        if not user or not user.is_active:
            # Clear session data (can't delete cookies here since we don't have response)
            request.session.clear()
            logger.info("validate_session clearing session for inactive/missing user_id: %s", user_id)
            return ""

    logger.info("Valid Session, Access granted.")
    return user_id


def get_token_expiry(creds) -> str:
    try:
        token_expiry = creds.expiry.isoformat()
    except Exception as e:
        logger.error("Failed to parse token expiry: %s", e)
        token_expiry = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    return token_expiry


def is_token_expired(iso_expiry: str) -> bool:
    """
    Converts ISO format timestamp (which serves as the expiry time of the token) to datetime.
    If the current time is greater than the expiry time,
    the token is expired.
    """
    if iso_expiry:
        datetime_expiry = datetime.fromisoformat(iso_expiry)  # UTC time
        if datetime_expiry.tzinfo is None:
            datetime_expiry = datetime_expiry.replace(tzinfo=timezone.utc)
        difference_in_minutes = (
            datetime_expiry - datetime.now(timezone.utc)
        ).total_seconds() / 60
        return difference_in_minutes <= 0

    return True


def is_token_near_expiry(iso_expiry: str, threshold_minutes: int = TOKEN_REFRESH_THRESHOLD_MINUTES) -> bool:
    """
    Check if token is expired or will expire within threshold_minutes.
    Used to proactively refresh tokens before they expire.
    """
    if iso_expiry:
        datetime_expiry = datetime.fromisoformat(iso_expiry)
        if datetime_expiry.tzinfo is None:
            datetime_expiry = datetime_expiry.replace(tzinfo=timezone.utc)
        difference_in_minutes = (
            datetime_expiry - datetime.now(timezone.utc)
        ).total_seconds() / 60
        return difference_in_minutes <= threshold_minutes
    return True


def attempt_token_refresh(
    request: Request,
    db_session: database.DBSession,
    user_id: str,
) -> bool:
    """
    Attempt to refresh expired/near-expiry tokens using stored credentials.

    Returns:
        True if refresh succeeded and session was updated, False otherwise
    """
    from utils.credential_service import load_credentials

    # Try email_sync credentials first, then primary
    for cred_type in ["email_sync", "primary"]:
        creds = load_credentials(
            db_session,
            user_id,
            credential_type=cred_type,
            auto_refresh=True
        )

        if creds and creds.token and creds.expiry:
            # Update session with refreshed tokens
            request.session["access_token"] = creds.token
            request.session["token_expiry"] = get_token_expiry(creds)

            # Update stored creds in session for backup
            creds_dict = {
                "token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "scopes": list(creds.scopes) if creds.scopes else []
            }
            request.session["creds"] = json.dumps(creds_dict)

            logger.info("Successfully refreshed token for user %s using %s credentials",
                       user_id, cred_type)
            return True

    logger.warning("Token refresh failed for user %s - no valid credentials found", user_id)
    return False
