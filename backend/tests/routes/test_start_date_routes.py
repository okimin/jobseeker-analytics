# backend/tests/routes/test_start_date_routes.py
from sqlmodel import Session

def test_set_start_date(db_session: Session, logged_in_client, logged_in_user):
    """
    Test setting the start date for a user who was manually added.
    """

    # 1. Manually create user with no start_date
    db_session.add(logged_in_user)
    db_session.commit()
    db_session.refresh(logged_in_user)
    assert logged_in_user.start_date is None

    # 2. User is prompted to set their start date
    start_date_str = "2024-05-10"
    response = logged_in_client.post("/set-start-date", data={"start_date": start_date_str})
    
    assert response.status_code == 200
    assert response.json() == {"message": "Start date updated successfully"}

    # 3. Verify the date in the database
    db_session.refresh(logged_in_user)
    assert logged_in_user.start_date is not None
    assert logged_in_user.start_date.strftime("%Y-%m-%d") == start_date_str
