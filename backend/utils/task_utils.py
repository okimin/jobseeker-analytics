from db import processing_tasks as task_models
from sqlmodel import select
import logging
from utils.config_utils import get_settings

# Logger setup
logger = logging.getLogger(__name__)
settings = get_settings()

def processed_emails_exceeds_rate_limit(user_id, db_session):
    logger.info(f"Fetching processed task count for user_id: {user_id}")
    process_task_run = db_session.exec(
        select(task_models.TaskRuns).filter_by(user_id=user_id)
    ).one_or_none()
    if process_task_run is None:
        logger.info(f"No task run found for user_id: {user_id}")
        return False
    
    # Check if the task was completed more than an hour ago
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    task_datetime = process_task_run.updated if process_task_run.updated else None

    # If the task was completed more than an hour ago, don't apply rate limiting
    if task_datetime and (now - task_datetime) > timedelta(hours=1):
        logger.info(f"Task was completed at {task_datetime}, not applying rate limit")
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
