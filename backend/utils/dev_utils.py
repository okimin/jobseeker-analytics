# backend/db/utils/dev_utils.py
import logging
from datetime import datetime, timezone, timedelta
from sqlmodel import select, Session
from db.users import Users
from session.session_layer import create_random_session_string
from utils.config_utils import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

def seed_dev_user(db_session: Session):
    """
    Seeds dev user for local development with active status from backend/.env file.
    """
    config = {"email": settings.DEV_USER_GMAIL, "active": settings.DEV_USER_IS_ACTIVE, "label": create_random_session_string()}
    
    statement = select(Users).where(Users.user_email == config["email"])
    user = db_session.exec(statement).first()

    if not user:
        logger.info(f"Seeding {config['label']} dev user: {config['email']}")
        new_user = Users(
            user_id=f"dev_{config['label'].lower()}", 
            user_email=config["email"],
            start_date=datetime.now(timezone.utc) - timedelta(days=1),
            is_active=config["active"]
        )
        db_session.add(new_user)
    else:
        # Ensure existing seed users have the correct status
        if config["active"] != user.is_active:
            logger.info(f"Updating {config['label']} status for: {config['email']}")
            user.is_active = config["active"]
            db_session.add(user)
    
    db_session.commit()