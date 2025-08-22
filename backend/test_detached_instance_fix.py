#!/usr/bin/env python3
"""
Test script to verify the DetachedInstanceError fix.
"""

import asyncio
import logging
from sqlmodel import Session, select
from db import processing_tasks as task_models
from database import engine
from routes.email_routes import update_task_progress

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_update_task_progress():
    """Test the update_task_progress helper function."""
    user_id = "test_detached_user"
    
    with Session(engine) as db_session:
        # Create a task
        task_run = task_models.TaskRuns(
            user_id=user_id,
            status=task_models.STARTED,
            total_emails=10,
            processed_emails=0
        )
        db_session.add(task_run)
        db_session.commit()
        
        # Test updating progress
        updated_task = update_task_progress(user_id, db_session, processed_emails=5)
        assert updated_task is not None
        assert updated_task.processed_emails == 5
        logger.info(f"✅ Progress update successful: {updated_task.processed_emails}/10")
        
        # Test updating status
        updated_task = update_task_progress(user_id, db_session, status=task_models.FINISHED)
        assert updated_task is not None
        assert updated_task.status == task_models.FINISHED
        logger.info(f"✅ Status update successful: {updated_task.status}")
        
        # Test multiple updates at once
        updated_task = update_task_progress(
            user_id, 
            db_session, 
            processed_emails=10, 
            status=task_models.FINISHED
        )
        assert updated_task is not None
        assert updated_task.processed_emails == 10
        assert updated_task.status == task_models.FINISHED
        logger.info(f"✅ Multiple updates successful: {updated_task.processed_emails}/10, {updated_task.status}")
        
        # Clean up
        db_session.delete(updated_task)
        db_session.commit()
        logger.info("✅ Test completed successfully")


def test_detached_instance_scenario():
    """Test the scenario that was causing DetachedInstanceError."""
    user_id = "test_detached_scenario"
    
    with Session(engine) as db_session:
        # Create a task
        task_run = task_models.TaskRuns(
            user_id=user_id,
            status=task_models.STARTED,
            total_emails=5,
            processed_emails=0
        )
        db_session.add(task_run)
        db_session.commit()
        
        # Simulate the problematic scenario
        for i in range(3):
            logger.info(f"Processing email {i + 1}")
            
            # Update progress using the helper function (this should not cause DetachedInstanceError)
            updated_task = update_task_progress(user_id, db_session, processed_emails=i + 1)
            
            if updated_task:
                # This should work without DetachedInstanceError
                current_count = updated_task.processed_emails
                logger.info(f"Current progress: {current_count}/5")
            else:
                logger.error("Failed to update task progress")
                break
        
        # Clean up
        final_task = db_session.exec(
            select(task_models.TaskRuns).filter_by(user_id=user_id)
        ).one_or_none()
        if final_task:
            db_session.delete(final_task)
            db_session.commit()
        
        logger.info("✅ Detached instance scenario test completed")


if __name__ == "__main__":
    print("=== Testing DetachedInstanceError Fix ===\n")
    
    try:
        test_update_task_progress()
        print()
        test_detached_instance_scenario()
        print("\n🎉 All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()