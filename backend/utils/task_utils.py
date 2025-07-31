from db import processing_tasks as task_models
from sqlmodel import Session, select
import database
import logging
from utils.config_utils import get_settings

# Logger setup
logger = logging.getLogger(__name__)
settings = get_settings()

def processed_emails_exceeds_rate_limit(user_id):
    with Session(database.engine) as db_session:
        result = db_session.bind.url
        logger.info("processed_emails_exceeds_rate_limit Connected to database: %s, user: %s, host: %s",
                   result.database, result.username, result.host)
        logger.info(f"Fetching processed task count for user_id: {user_id}")
        process_task_run = db_session.exec(
            select(task_models.TaskRuns).filter_by(user_id=user_id)
        ).one_or_none()
        if process_task_run is None:
            logger.info(f"No task run found for user_id: {user_id}")
            return False
        
        # Check if the task was completed on a different day
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).date()
        task_date = process_task_run.updated.date() if process_task_run.updated else None
        
        # If the task was completed on a different day, don't apply rate limiting
        if task_date and task_date < today:
            logger.info(f"Task was completed on {task_date}, not applying rate limit for today")
            return False
        
        total_processed_tasks = process_task_run.processed_emails or 0
        logger.info(f"Total processed tasks: {total_processed_tasks}")
        return exceeds_rate_limit(total_processed_tasks)


def exceeds_rate_limit(count: int):
    rate_limit = settings.batch_size_by_env
    if count >= rate_limit:
        logger.info(f"Rate limit exceeded: {count} >= {rate_limit}")
        return True
    else:
        logger.info(f"Rate limit not exceeded: {count} < {rate_limit}")
        return False
