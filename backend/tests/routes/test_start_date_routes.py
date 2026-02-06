# backend/tests/routes/test_start_date_routes.py
import json
from unittest import mock
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

    # 2. User is prompted to set their start date using PUT /settings/start-date
    # Mock session to have credentials (required by the endpoint for potential rescan)
    mock_creds = json.dumps({"token": "mock_token", "refresh_token": "mock_refresh"})
    start_date_str = "2024-05-10"

    with mock.patch(
        "starlette.requests.Request.session",
        new_callable=mock.PropertyMock,
        return_value={"creds": mock_creds},
    ):
        response = logged_in_client.put(
            "/settings/start-date",
            json={"preset": "custom", "custom_date": start_date_str},
        )

    assert response.status_code == 200
    data = response.json()
    assert "start_date" in data
    assert data["start_date"].startswith(start_date_str)

    # 3. Verify the date in the database
    db_session.refresh(logged_in_user)
    assert logged_in_user.start_date is not None
    assert logged_in_user.start_date.strftime("%Y-%m-%d") == start_date_str
