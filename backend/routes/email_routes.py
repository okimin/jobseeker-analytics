import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlmodel import Session, select, desc
from googleapiclient.discovery import build
from db.user_emails import UserEmails
from db import processing_tasks as task_models
from db.utils.user_email_utils import create_user_email
from utils.auth_utils import AuthenticatedUser
from utils.email_utils import get_email_ids, get_email
from utils.llm_utils import process_email
from utils.config_utils import get_settings
from session.session_layer import validate_session
import database
from google.oauth2.credentials import Credentials
import json
from start_date.storage import get_start_date_email_filter
from constants import QUERY_APPLIED_EMAIL_FILTER
from datetime import datetime, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
import threading
import asyncio

limiter = Limiter(key_func=get_remote_address)

# Logger setup
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()
APP_URL = settings.APP_URL

SECONDS_BETWEEN_FETCHING_EMAILS = 1 * 60 * 60  # 1 hour

# FastAPI router for email routes
router = APIRouter()

# Global dictionary to track running fetch tasks per user
fetch_email_tasks = {}
fetch_email_tasks_lock = threading.Lock()

@router.get("/processing", response_class=HTMLResponse)
async def processing(request: Request, db_session: database.DBSession, user_id: str = Depends(validate_session)):
    logging.info("user_id:%s processing", user_id)
    if not user_id:
        logger.info("user_id: not found, redirecting to login")
        return RedirectResponse("/logout", status_code=303)

    process_task_run: task_models.TaskRuns = db_session.get(task_models.TaskRuns, user_id)

    if process_task_run.status == task_models.FINISHED:
        logger.info("user_id: %s processing complete", user_id)
        return JSONResponse(
            content={
                "message": "Processing complete",
                "processed_emails": process_task_run.processed_emails,
                "total_emails": process_task_run.total_emails,
            }
        )
    else:
        logger.info("user_id: %s processing not complete for file", user_id)
        return JSONResponse(
            content={
                "message": "Processing in progress",
                "processed_emails": process_task_run.processed_emails,
                "total_emails": process_task_run.total_emails,
            }
        )


@router.get("/get-emails", response_model=List[UserEmails])
@limiter.limit("5/minute")
def query_emails(request: Request, db_session: database.DBSession, user_id: str = Depends(validate_session)) -> None:
    try:
        logger.info(f"Fetching emails for user_id: {user_id}")

        # Query emails sorted by date (newest first)
        statement = select(UserEmails).where(UserEmails.user_id == user_id).order_by(desc(UserEmails.received_at))
        user_emails = db_session.exec(statement).all()

        # Filter out records with "unknown" application status
        filtered_emails = [
            email for email in user_emails 
            if email.application_status and email.application_status.lower() != "unknown"
        ]

        logger.info(f"Found {len(user_emails)} total emails, returning {len(filtered_emails)} after filtering out 'unknown' status")
        return filtered_emails  # Return filtered list

    except Exception as e:
        logger.error(f"Error fetching emails for user_id {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
        

@router.delete("/delete-email/{email_id}")
async def delete_email(request: Request, db_session: database.DBSession, email_id: str, user_id: str = Depends(validate_session)):
    """
    Delete an email record by its ID for the authenticated user.
    """
    try:
        # Query the email record to ensure it exists and belongs to the user
        email_record = db_session.exec(
            select(UserEmails).where(
                (UserEmails.id == email_id) & (UserEmails.user_id == user_id)
            )
        ).first()

        if not email_record:
            logger.warning(f"Email with id {email_id} not found for user_id {user_id}")
            raise HTTPException(
                status_code=404, detail=f"Email with id {email_id} not found"
            )

        # Delete the email record
        db_session.delete(email_record)
        db_session.flush()

        logger.info(f"Email with id {email_id} deleted successfully for user_id {user_id}")
        return {"message": "Item deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting email with id {email_id} for user_id {user_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to delete email: {str(e)}"
        )
        

@router.post("/fetch-emails")
@limiter.limit("5/minute")
async def start_fetch_emails(
    request: Request, background_tasks: BackgroundTasks, user_id: str = Depends(validate_session)
):
    """Starts the background task for fetching and processing emails."""
    if not user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    logger.info(f"user_id:{user_id} start_fetch_emails")
    creds_json = request.session.get("creds")
    if not creds_json:
        logger.error(f"Missing credentials for user_id: {user_id}")
        return HTMLResponse(content="User not authenticated. Please log in again.", status_code=401)
    try:
        creds_dict = json.loads(creds_json)
        creds = Credentials.from_authorized_user_info(creds_dict)
        user = AuthenticatedUser(creds)
        logger.info(f"Starting email fetching process for user_id: {user_id}")
        # Start email fetching in the background and track the task
        loop = asyncio.get_event_loop()
        task = loop.create_task(asyncio.to_thread(fetch_emails_to_db, user, request, user_id=user_id))
        with fetch_email_tasks_lock:
            fetch_email_tasks[user_id] = task
        def cleanup_task(fut):
            with fetch_email_tasks_lock:
                fetch_email_tasks.pop(user_id, None)
        task.add_done_callback(cleanup_task)
        return JSONResponse(content={"message": "Email fetching started"}, status_code=200)
    except Exception as e:
        logger.error(f"Error reconstructing credentials: {e}")
        raise HTTPException(status_code=500, detail="Failed to authenticate user")


@router.post("/stop-fetch-emails")
async def stop_fetch_emails(request: Request, user_id: str = Depends(validate_session)):
    """
    Stops the background email fetching task for the authenticated user.
    """
    with fetch_email_tasks_lock:
        task = fetch_email_tasks.get(user_id)
    if not task:
        logger.warning(f"No running fetch-emails task for user_id {user_id}")
        return JSONResponse(content={"message": "No running fetch-emails task to stop."}, status_code=404)
    # Attempt to cancel the task
    cancelled = task.cancel()
    logger.info(f"Cancelled fetch-emails task for user_id {user_id}: {cancelled}")
    return JSONResponse(content={"message": "Fetch-emails task cancelled."}, status_code=200)


def fetch_emails_to_db(user: AuthenticatedUser, request: Request, last_updated: Optional[datetime] = None, *, user_id: str) -> None:
    logger.info(f"Fetching emails to db for user_id: {user_id}")

    with Session(database.engine) as db_session:
        # we track starting and finishing fetching of emails for each user
        process_task_run = (
            db_session.query(task_models.TaskRuns).filter_by(user_id=user_id).one_or_none()
        )
        if process_task_run is None:
            # if this is the first time running the task for the user, create a record
            process_task_run = task_models.TaskRuns(user_id=user_id)
            db_session.add(process_task_run)
        elif datetime.now() - process_task_run.updated < timedelta(
            seconds=SECONDS_BETWEEN_FETCHING_EMAILS
        ):
            # limit how frequently emails can be fetched by a specific user
            logger.warning(
                "Less than an hour since last fetch of emails for user",
                extra={"user_id": user_id},
            )
            return

        # this is helpful if the user applies for a new job and wants to rerun the analysis during the same session
        process_task_run.processed_emails = 0
        process_task_run.total_emails = 0
        process_task_run.status = task_models.STARTED

        db_session.commit()  # sync with the database so calls in the future reflect the task is already started

        start_date = request.session.get("start_date")
        logger.info(f"start_date: {start_date}")
        start_date_query = get_start_date_email_filter(start_date)
        is_new_user = request.session.get("is_new_user")

        query = start_date_query
        # check for users last updated email
        if last_updated:
            # this converts our date time to number of seconds 
            additional_time = int(last_updated.timestamp())
            # we append it to query so we get only emails recieved after however many seconds
            # for example, if the newest email you’ve stored was received at 2025‑03‑20 14:32 UTC, we convert that to 1710901920s 
            # and tell Gmail to fetch only messages received after March 20, 2025 at 14:32 UTC.
            if not start_date or not is_new_user:
                query = QUERY_APPLIED_EMAIL_FILTER
                query += f" after:{additional_time}"
            
                logger.info(f"user_id:{user_id} Fetching emails after {last_updated.isoformat()}")
        else:
            logger.info(f"user_id:{user_id} Fetching all emails (no last_date maybe with start date)")
            logger.info(
                f"user_id:{user_id} Fetching all emails (no last_date maybe with start date)"
            )

        service = build("gmail", "v1", credentials=user.creds)

        messages = get_email_ids(
            query=query, gmail_instance=service
        )
        # Update session to remove "new user" status
        request.session["is_new_user"] = False

        if not messages:
            logger.info(f"user_id:{user_id} No job application emails found.")
            process_task_run = db_session.get(task_models.TaskRuns, user_id)
            process_task_run.status = task_models.FINISHED
            db_session.commit()
            return

        logger.info(f"user_id:{user.user_id} Found {len(messages)} emails.")
        process_task_run.total_emails = len(messages)
        db_session.commit()

        email_records = []  # list to collect email records

        for idx, message in enumerate(messages):
            message_data = {}
            # (email_subject, email_from, email_domain, company_name, email_dt)
            msg_id = message["id"]
            logger.info(
                f"user_id:{user_id} begin processing for email {idx + 1} of {len(messages)} with id {msg_id}"
            )
            process_task_run.processed_emails = idx + 1
            db_session.commit()

            msg = get_email(message_id=msg_id, gmail_instance=service, user_email=user.user_email)

            if msg:
                try:
                    result = process_email(msg["text_content"])
                    # if values are empty strings or null, set them to "unknown"
                    for key in result.keys():
                        if not result[key]:
                            result[key] = "unknown"
                except Exception as e:
                    logger.error(
                        f"user_id:{user_id} Error processing email {idx + 1} of {len(messages)} with id {msg_id}: {e}"
                    )

                if not isinstance(result, str) and result:
                    logger.info(
                        f"user_id:{user_id} successfully extracted email {idx + 1} of {len(messages)} with id {msg_id}"
                    )
                    if result.get("job_application_status").lower().strip() == "false positive":
                        logger.info(
                            f"user_id:{user_id} email {idx + 1} of {len(messages)} with id {msg_id} is a false positive, not related to job search"
                        )
                        continue  # skip this email if it's a false positive
                else:  # processing returned unknown which is also likely false positive
                    logger.warning(
                        f"user_id:{user_id} failed to extract email {idx + 1} of {len(messages)} with id {msg_id}"
                    )
                    result = {"company_name": "unknown", "application_status": "unknown", "job_title": "unknown"}

                message_data = {
                    "id": msg_id,
                    "company_name": result.get("company_name", "unknown"),
                    "application_status": result.get("job_application_status", "unknown"),
                    "received_at": msg.get("date", "unknown"),
                    "subject": msg.get("subject", "unknown"),
                    "job_title": result.get("job_title", "unknown"),
                    "from": msg.get("from", "unknown"),
                }
                email_record = create_user_email(user, message_data)
                if email_record:
                    email_records.append(email_record)

        # batch insert all records at once
        if email_records:
            db_session.add_all(email_records)
            logger.info(
                f"Added {len(email_records)} email records for user {user_id}"
            )

        process_task_run.status = task_models.FINISHED
        db_session.commit()

        logger.info(f"user_id:{user_id} Email fetching complete.")


@router.delete("/delete-emails")
@limiter.limit("1/minute")
async def delete_all_emails(request: Request, db_session: database.DBSession, user_id: str = Depends(validate_session)):
    """
    Deletes all email records for the authenticated user.
    """
    try:
        # Query all email records for the user
        email_records = db_session.exec(
            select(UserEmails).where(UserEmails.user_id == user_id)
        ).all()

        if not email_records:
            logger.warning(f"No emails found for user_id {user_id}")
            return JSONResponse(content={"message": "No emails to delete"}, status_code=404)

        # Delete all email records
        for record in email_records:
            db_session.delete(record)

        db_session.commit()
        logger.info(f"All emails deleted successfully for user_id {user_id}")
        return JSONResponse(content={"message": "All emails deleted successfully"}, status_code=200)

    except Exception as e:
        logger.error(f"Error deleting emails for user_id {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete emails: {str(e)}")

@router.delete("/delete-emails-before-start-date")
async def delete_emails_before_start_date(request: Request, db_session: database.DBSession, user_id: str = Depends(validate_session)):
    """
    Deletes all email records for the authenticated user that were received before the user's start date.
    """
    try:
        # Get the user's start date from the session
        start_date = request.session.get("start_date")
        if not start_date:
            logger.warning(f"No start date found for user_id {user_id}")
            return JSONResponse(content={"message": "No start date set"}, status_code=404)

        # Convert start date to datetime object
        start_date_dt = datetime.fromisoformat(start_date)

        # Query email records for the user
        email_records = db_session.exec(
            select(UserEmails).where(UserEmails.user_id == user_id)
        ).all()

        if not email_records:
            logger.warning(f"No emails found for user_id {user_id}")
            return JSONResponse(content={"message": "No emails to delete"}, status_code=404)

        # Filter and delete emails received before the start date
        deleted_count = 0
        for record in email_records:
            if record.received_at < start_date_dt:
                db_session.delete(record)
                deleted_count += 1

        db_session.commit()

        logger.info(f"Deleted {deleted_count} emails before start date for user_id {user_id}")
        return JSONResponse(content={"message": f"Deleted {deleted_count} emails before start date"}, status_code=200)

    except Exception as e:
        logger.error(f"Error deleting emails before start date for user_id {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete emails: {str(e)}")
