import logging
from fastapi import HTTPException, Depends, Request
from sqlmodel import select
import database
from session.session_layer import validate_session
from db.users import Users

logger = logging.getLogger(__name__)


def require_onboarding_complete(
    request: Request,
    db_session: database.DBSession,
    user_id: str = Depends(validate_session)
) -> str:
    """
    Dependency that verifies user has completed onboarding.
    Use this for protected routes that require subscription selection.
    Returns 403 with X-Onboarding-Required header if not onboarded.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db_session.exec(select(Users).where(Users.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.has_completed_onboarding:
        raise HTTPException(
            status_code=403,
            detail="Onboarding not completed",
            headers={"X-Onboarding-Required": "true"}
        )

    return user_id
