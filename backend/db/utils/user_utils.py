import logging
from typing import Optional, Tuple
from db.user_emails import UserEmails
from sqlmodel import Session, select, func
from db.users import Users 
from datetime import datetime, timedelta, timezone 
from database import engine

logger = logging.getLogger(__name__)

def get_last_email_date(user_id: str, db_session) -> Optional[datetime]:
    """
    Checks date of user's most recent email 

    """
    result = db_session.bind.url
    logger.info("get_last_email_date Connected to database: %s, user: %s, host: %s",
                result.database, result.username, result.host)
    db_session.commit()  # Commit pending changes to ensure the database is in latest state
    row = db_session.exec(
        select(func.max(UserEmails.received_at))
        .where(UserEmails.user_id == user_id)
    ).one() # aggregates in SQL to a single row
    return row

def user_exists(user, db_session) -> Tuple[bool, Optional[datetime]]:
    """
    Checks if user is already in the database
    """
    # Use provided session for fresh data
    result = db_session.bind.url
    logger.info("user_exists Connected to database: %s, user: %s, host: %s",
                result.database, result.username, result.host)
    db_session.commit()  # Commit pending changes to ensure the database is in latest state
    existing_user = db_session.exec(select(Users).where(Users.user_id == user.user_id)).first()
    if not existing_user:
        logger.info("user_exists: user does not exist in the database")
        return False, None
    else:
        logger.info("user_exists: user exists in the database")
        last_fetched_date = get_last_email_date(user.user_id, db_session)
        return True, last_fetched_date

def add_user(user, request, db_session, start_date=None) -> Users:
    """
    Writes user data to the users model and session storage
    """
    result = db_session.bind.url
    logger.info("add_user Connected to database: %s, user: %s, host: %s",
                result.database, result.username, result.host)
    # Use provided session
    db_session.commit()  # Commit pending changes to ensure the database is in latest state
    existing_user = db_session.exec(select(Users).where(Users.user_id == user.user_id)).first()

    if not existing_user:
        start_date = getattr(user, "start_date", None) or (datetime.now(timezone.utc) - timedelta(days=90))

        if isinstance(start_date, datetime):
            start_date = start_date.strftime("%Y-%m-%d")

        # add a new user record
        new_user = Users(
            user_id=user.user_id,
            user_email=user.user_email,
            start_date=start_date
        )

        db_session.add(new_user)
        db_session.commit()
        db_session.refresh(new_user)
        logger.info(f"Created new user record for user_id: {user.user_id}")

        # Write start date to session storage
        if isinstance(start_date, str):
            request.session["start_date"] = start_date  # Already a string, no need to convert
        else:
            request.session["start_date"] = start_date.isoformat()  # Convert only if it's a datetime object

        return new_user
    else:
        logger.info(f"User {user.user_id} already exists in the database.")
        return existing_user
