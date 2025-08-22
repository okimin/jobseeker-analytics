#!/usr/bin/env python3
"""
Simple test script to verify cancellation functionality.
This script demonstrates how the cancellation mechanism works.
"""

import asyncio
import logging
from typing import Dict

# Mock the global task registry
running_tasks: Dict[str, asyncio.Task] = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def mock_email_processing(user_id: str, total_emails: int = 10):
    """Mock email processing function that can be cancelled."""
    try:
        for i in range(total_emails):
            # Check for cancellation before processing each email
            if asyncio.current_task().cancelled():
                logger.info(f"user_id:{user_id} Task cancelled, stopping at email {i + 1}")
                raise asyncio.CancelledError()
            
            logger.info(f"user_id:{user_id} Processing email {i + 1}/{total_emails}")
            
            # Simulate LLM processing time
            await asyncio.sleep(1)
            
        logger.info(f"user_id:{user_id} All emails processed successfully")
        
    except asyncio.CancelledError:
        logger.info(f"user_id:{user_id} Email processing cancelled by user")
        raise
    finally:
        # Clean up task from registry
        if user_id in running_tasks:
            del running_tasks[user_id]


async def start_processing(user_id: str):
    """Start email processing task."""
    if user_id in running_tasks and not running_tasks[user_id].done():
        logger.warning(f"Task already running for user_id: {user_id}")
        return False
    
    # Create and store the task
    task = asyncio.create_task(mock_email_processing(user_id))
    running_tasks[user_id] = task
    
    logger.info(f"Started processing for user_id: {user_id}")
    return True


async def cancel_processing(user_id: str):
    """Cancel email processing task."""
    if user_id in running_tasks:
        task = running_tasks[user_id]
        if not task.done():
            task.cancel()
            logger.info(f"Cancelled processing for user_id: {user_id}")
            
            # Wait for task to handle cancellation
            try:
                await asyncio.wait_for(task, timeout=2.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass
            
            return True
        else:
            logger.info(f"No active task to cancel for user_id: {user_id}")
            return False
    else:
        logger.info(f"No running task found for user_id: {user_id}")
        return False


async def main():
    """Test the cancellation functionality."""
    user_id = "test_user_123"
    
    print("=== Testing Email Processing Cancellation ===\n")
    
    # Start processing
    await start_processing(user_id)
    
    # Let it run for a few seconds
    await asyncio.sleep(3)
    
    # Cancel the processing
    cancelled = await cancel_processing(user_id)
    
    if cancelled:
        print(f"\n✅ Successfully cancelled processing for {user_id}")
    else:
        print(f"\n❌ Failed to cancel processing for {user_id}")
    
    # Wait a moment to see the cancellation take effect
    await asyncio.sleep(1)
    
    print(f"\nRunning tasks: {list(running_tasks.keys())}")


if __name__ == "__main__":
    asyncio.run(main())