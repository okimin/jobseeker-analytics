from fastapi import HTTPException, Depends, Request
from sqlmodel import select, and_
from database import DBSession
from session.session_layer import validate_session
from db.users import CoachClientLink, Users

def get_context_user_id(
    request: Request,
    db_session: DBSession,
    authenticated_user_id: str = Depends(validate_session)
) -> str:
    """
    Determines the target user_id for the query.
    If 'view_as_client' header/param is present, verifies relationship.
    Otherwise returns the authenticated user.
    """
    # Check if the caller wants to view a specific client's data
    target_client_id = request.query_params.get("view_as") or request.headers.get("X-View-As")

    if not target_client_id:
        return authenticated_user_id

    # If attempting to view someone else, verify the relationship
    if target_client_id != authenticated_user_id:
        statement = select(CoachClientLink).where(
            and_(
                CoachClientLink.coach_id == authenticated_user_id,
                CoachClientLink.client_id == target_client_id,
                CoachClientLink.end_date == None
            )
        )
        relationship = db_session.exec(statement).first()

        if not relationship:
            raise HTTPException(
                status_code=403, 
                detail="Access denied: You are not an authorized coach."
            )
            
    return target_client_id