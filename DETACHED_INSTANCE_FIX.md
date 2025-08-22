# DetachedInstanceError Fix

## Issue
After implementing progress tracking, we encountered a `DetachedInstanceError`:

```
sqlalchemy.orm.exc.DetachedInstanceError: Instance <TaskRuns at 0xffff8131f070> is not bound to a Session; attribute refresh operation cannot proceed
```

## Root Cause
The error occurred because we were trying to maintain a reference to the `TaskRuns` object across multiple database commits. When a SQLAlchemy session commits, objects can become "detached" from the session, meaning they're no longer bound to it. Attempting to access attributes on detached objects causes this error.

### Problematic Pattern
```python
# This pattern causes DetachedInstanceError
process_task_run.processed_emails = idx + 1
db_session.commit()  # Object becomes detached here

# Later in the code...
if exceeds_rate_limit(process_task_run.processed_emails):  # ❌ Error here
    break
```

## Solution
Created a helper function that safely updates task progress by re-querying the object from the database each time we need to update it.

### Helper Function
```python
def update_task_progress(user_id: str, db_session, **updates):
    """Safely update task progress by re-querying the object."""
    process_task_run = db_session.exec(
        select(task_models.TaskRuns).filter_by(user_id=user_id)
    ).one_or_none()
    
    if process_task_run:
        for key, value in updates.items():
            setattr(process_task_run, key, value)
        db_session.commit()
        return process_task_run
    return None
```

## Changes Made

### 1. Progress Updates
**Before:**
```python
db_session.refresh(process_task_run)
process_task_run.processed_emails = idx + 1
db_session.commit()
```

**After:**
```python
process_task_run = update_task_progress(user_id, db_session, processed_emails=idx + 1)
```

### 2. Status Updates
**Before:**
```python
process_task_run.status = task_models.FINISHED
db_session.commit()
```

**After:**
```python
update_task_progress(user_id, db_session, status=task_models.FINISHED)
```

### 3. Rate Limit Check
**Before:**
```python
if exceeds_rate_limit(process_task_run.processed_emails):  # ❌ DetachedInstanceError
```

**After:**
```python
if exceeds_rate_limit(idx + 1):  # ✅ Use current index instead
```

## Benefits

### 1. Eliminates DetachedInstanceError
- No more attempts to access attributes on detached objects
- Each update operation gets a fresh object from the database

### 2. Cleaner Code
- Consistent pattern for all task updates
- Reduces boilerplate code for re-querying objects

### 3. More Reliable
- Handles cases where the task might not exist
- Atomic updates with proper error handling

### 4. Flexible
- Can update multiple attributes in a single call
- Returns the updated object for further use if needed

## Usage Examples

```python
# Update just progress
update_task_progress(user_id, db_session, processed_emails=5)

# Update just status
update_task_progress(user_id, db_session, status=task_models.CANCELLED)

# Update multiple fields
update_task_progress(
    user_id, 
    db_session, 
    processed_emails=10, 
    status=task_models.FINISHED
)
```

## Technical Details

### Why This Happens
SQLAlchemy's session management is designed to track object state. When you commit a session:
1. Changes are written to the database
2. Objects may become "detached" from the session
3. Accessing lazy-loaded attributes on detached objects fails

### The Fix
Instead of maintaining object references across commits:
1. Re-query the object when we need to update it
2. Make the update
3. Commit immediately
4. Don't rely on the object reference afterward

This pattern ensures we always work with "attached" objects that are properly bound to the current session.

## Testing
- Created `backend/test_detached_instance_fix.py` to verify the fix
- Tests both single and multiple attribute updates
- Simulates the original problematic scenario

The fix ensures robust database operations without DetachedInstanceError while maintaining all the progress tracking and cancellation functionality.