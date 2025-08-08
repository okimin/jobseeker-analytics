from db.user_emails import UserEmails
from datetime import datetime, timezone
import email.utils
import logging
from sqlmodel import select
from utils.job_utils import normalize_job_title

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
        logger.debug(f"Creating user email record for user_id: {user.user_id}, email_id: {message_data['id']}")
        
        received_at_str = message_data["received_at"]
        received_at = parse_email_date(received_at_str)  # parse_email_date function was created as different date formats were being pulled from the data
        
        # Check if email already exists
        if check_email_exists(user.user_id, message_data["id"], db_session):
            logger.info(f"Email with ID {message_data['id']} already exists in the database.")
            return None
        
        # Normalize the job title
        job_title = message_data["job_title"]
        normalized_job_title = ""
        
        logger.debug(f"Processing job title normalization: '{job_title}'")
        
        if job_title and job_title.lower() != "unknown":
            try:
                logger.debug(f"Attempting to normalize job title: '{job_title}'")
                normalized_result = normalize_job_title(job_title)
                if normalized_result and normalized_result.strip():
                    normalized_job_title = normalized_result  # Already capitalized by normalize_job_title
                    logger.debug(f"Job title normalized successfully: '{job_title}' -> '{normalized_job_title}'")
                else:
                    normalized_job_title = job_title.title()  # Fall back to capitalized original
                    logger.debug(f"Normalization returned empty, using capitalized original: '{job_title}' -> '{normalized_job_title}'")
            except Exception as e:
                logger.warning(f"Failed to normalize job title '{job_title}': {e}")
                normalized_job_title = job_title.title()  # Fall back to capitalized original
        else:
            normalized_job_title = job_title  # Keep "unknown" or empty titles as-is
            logger.debug(f"Job title is unknown or empty, keeping as-is: '{normalized_job_title}'")
        
        logger.debug(f"Creating UserEmails record with normalized_job_title: '{normalized_job_title}'")
                
        record = UserEmails(
            id=message_data["id"],
            user_id=user.user_id,
            company_name=message_data["company_name"],
            application_status=message_data["application_status"],
            received_at=received_at,
            subject=message_data["subject"],
            job_title=job_title,
            normalized_job_title=normalized_job_title,
            email_from=message_data["from"]
        )
    
        logger.debug(f"Successfully created UserEmails record for user_id: {user.user_id}, email_id: {message_data['id']}")
        return record

    except Exception as e:
        logger.error(f"Error creating UserEmail record for user_id: {user.user_id}, email_id: {message_data.get('id', 'unknown')}: {e}")
        return None
