import datetime
import logging
import json
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse, HTMLResponse
from google_auth_oauthlib.flow import Flow

from db.utils.user_utils import user_exists
from utils.auth_utils import AuthenticatedUser, get_google_authorization_url, get_refresh_token_status, get_creds, get_latest_refresh_token
from session.session_layer import create_random_session_string, validate_session, get_token_expiry
from utils.config_utils import get_settings
from utils.cookie_utils import set_conditional_cookie
from routes.email_routes import fetch_emails_to_db
import database
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

limiter = Limiter(key_func=get_remote_address)

# Logger setup
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# FastAPI router for Google login
router = APIRouter()

APP_URL = settings.APP_URL


@router.get("/login")
@limiter.limit("10/minute")
async def login(
    request: Request, background_tasks: BackgroundTasks, db_session: database.DBSession
):
    """Handles Google OAuth2 login and authorization code exchange."""
    code = request.query_params.get("code")

    flow = Flow.from_client_config(
        settings.GOOGLE_OAUTH2_CONFIG,
        settings.GOOGLE_SCOPES,
        redirect_uri=settings.REDIRECT_URI,
    )

    try:
        if not code:
            # Check if we have a refresh token in session
            has_refresh_token = get_refresh_token_status(request.session.get("creds"))
            authorization_url, _ = get_google_authorization_url(
                flow, has_refresh_token
            )
            return RedirectResponse(url=authorization_url)
        creds = get_creds(request=request, code=code, flow=flow)
        if type(creds, RedirectResponse):
            return creds
        user = AuthenticatedUser(creds)
        # Preserve existing session_id or create new one if none exists
        session_id = request.session.get("session_id") or create_random_session_string()
        request.session["session_id"] = session_id

        # Set session details
        request.session["token_expiry"] = get_token_expiry(creds)
        request.session["user_id"] = user.user_id
        request.session["access_token"] = creds.token
        request.session["creds"] = get_latest_refresh_token(old_creds=request.session.get("creds"), new_creds=creds)

        existing_user, last_fetched_date = user_exists(user, db_session)
        logger.info("User exists: %s, Last fetched date: %s", existing_user, last_fetched_date)
        if existing_user:
            if not existing_user.is_active:
                logger.warning("User %s is not active. Redirecting to inactive account page.", user.user_id)
                return RedirectResponse(
                    url=f"{settings.APP_URL}/errors?message=account_inactive",
                    status_code=303,
                )
            logger.info("User already exists in the database.")
            response = RedirectResponse(
                url=f"{settings.APP_URL}/processing", status_code=303
            )
            logger.info(
                "Settings.is_publicly_deployed: %s", settings.is_publicly_deployed
            )
            logger.info(
                "IS_DOCKER_CONTAINER: %s", os.environ.get("IS_DOCKER_CONTAINER")
            )

            background_tasks.add_task(
                fetch_emails_to_db,
                user,
                request,
                last_fetched_date,
                user_id=user.user_id,
                db_session=db_session,
            )
            logger.info("fetch_emails_to_db task started for user_id: %s fetching as of %s", user.user_id, last_fetched_date)
        else:
            return RedirectResponse(
                    url=f"{settings.APP_URL}/errors?message=account_inactive",
                    status_code=303,
                )

        response = set_conditional_cookie(
            key="Authorization", value=session_id, response=response
        )

        return response
    except Exception as e:
        logger.error("Login error: %s", e)
        return HTMLResponse(content="An error occurred, sorry!", status_code=500)


@router.get("/logout")
async def logout(request: Request, response: RedirectResponse):
    logger.info("Logging out")
    request.session.clear()
    response.delete_cookie(key="__Secure-Authorization")
    response.delete_cookie(key="Authorization")
    return RedirectResponse(f"{APP_URL}", status_code=303)


@router.get("/me")
async def getUser(request: Request, user_id: str = Depends(validate_session)):
    if not user_id:
        raise HTTPException(status_code=401, detail="No user id found in session")
    return {"user_id": user_id}
