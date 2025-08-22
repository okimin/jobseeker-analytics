#!/usr/bin/env python3
"""
Test script to verify progress tracking works correctly.
"""

import asyncio
import logging
from sqlmodel import Session, select
from db import processing_tasks as task_models
from database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def simulate_email_processing(user_id: str, total_emails: int = 5):
    """Simulate email processing with progress updates."""
    
    with Session(engine) as db_session:
        # Create or get task run
        process_task_run = db_session.exec(
            select(task_models.TaskRuns).filter_by(user_id=user_id)
        ).one_or_none()
        
        if not process_task_run:
            process_task_run = task_models.TaskRuns(
                user_id=user_id, 
                status=task_models.STARTED,
                total_emails=total_emails
            )
            db_session.add(process_task_run)
            db_session.commit()
        
        # Simulate processing emails
        for i in range(total_emails):
            logger.info(f"Processing email {i + 1}/{total_emails}")
            
            # Update progress
            db_session.refresh(process_task_run)
            process_task_run.processed_emails = i + 1
            db_session.commit()
            
            logger.info(f"Updated progress to {i + 1}/{total_emails} and committed")
            
            # Simulate processing time
            await asyncio.sleep(1)
        
        # Mark as finished
        process_task_run.status = task_models.FINISHED
        db_session.commit()
        logger.info("Processing completed")


def check_progress(user_id: str):
    """Check current progress from a separate session."""
    with Session(engine) as db_session:
        process_task_run = db_session.exec(
            select(task_models.TaskRuns).where(task_models.TaskRuns.user_id == user_id)
        ).first()
        
        if process_task_run:
            logger.info(f"Progress check: {process_task_run.processed_emails}/{process_task_run.total_emails} - Status: {process_task_run.status}")
            return process_task_run.processed_emails, process_task_run.total_emails, process_task_run.status
        else:
            logger.info("No task found")
            return 0, 0, "not_found"


async def main():
    """Test progress tracking."""
    user_id = "test_progress_user"
    
    print("=== Testing Progress Tracking ===\n")
    
    # Start processing in background
    task = asyncio.create_task(simulate_email_processing(user_id))
    
    # Check progress periodically
    for i in range(8):  # Check 8 times over 8 seconds
        await asyncio.sleep(1)
        processed, total, status = check_progress(user_id)
        print(f"Check {i+1}: {processed}/{total} - {status}")
        
        if status == task_models.FINISHED:
            break
    
    # Wait for task to complete
    await task
    
    # Final check
    processed, total, status = check_progress(user_id)
    print(f"\nFinal: {processed}/{total} - {status}")


if __name__ == "__main__":
    asyncio.run(main())