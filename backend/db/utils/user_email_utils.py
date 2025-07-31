from db.user_emails import UserEmails
from datetime import datetime, timezone
import email.utils
import logging
from sqlmodel import select

logger = logging.getLogger(__name__)

def parse_email_date(date_str: str) -> datetime:
    """
    Converts an email date string into a Python datetime object
    """
    dt = email.utils.parsedate_to_datetime(date_str)
    if dt is None:
        # default to current UTC datetime
        dt = datetime.now(timezone.utc)
    return dt


def check_email_exists(user_id: str, email_id: str, db_session) -> bool:
    """
    Checks if an email with the given emailId and userId exists in the database.
    """
    db_session.commit()  # Commit pending changes to ensure the database is in latest state
    statement = select(UserEmails).where(
        (UserEmails.user_id == user_id) & (UserEmails.id == email_id)
    )
    result = db_session.exec(statement).first()
    return result is not None


def create_user_email(user, message_data: dict, db_session) -> UserEmails:
    """
    Creates a UserEmail record instance from the provided data.
    """
    try:
        received_at_str = message_data["received_at"]
        received_at = parse_email_date(received_at_str)  # parse_email_date function was created as different date formats were being pulled from the data
        
        # Check if email already exists
        if check_email_exists(user.user_id, message_data["id"], db_session):
            logger.info(f"Email with ID {message_data['id']} already exists in the database.")
            return None
                
        return UserEmails(
            id=message_data["id"],
            user_id=user.user_id,
            company_name=message_data["company_name"],
            application_status=message_data["application_status"],
            received_at=received_at,
            subject=message_data["subject"],
            job_title=message_data["job_title"],
            email_from=message_data["from"]
        )
    except Exception as e:
        logger.error(f"Error creating UserEmail record: {e}")
        return None
