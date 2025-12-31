from session.session_layer import validate_session
from datetime import datetime, timedelta, timezone
from unittest import mock

def test_inactive_user_clears_session(inactive_user, mock_request, db_session):
    # Simulate session data for inactive user
    session_id = "test_session_id"
    mock_request.session = {
        "session_id": session_id,
        "access_token": "test_access_token",
        "token_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),  # valid
        "user_id": inactive_user.user_id,
    }
    mock_request.cookies = {"Authorization": session_id, "__Secure-Authorization": session_id}

    with mock.patch("session.session_layer.clear_session") as mock_clear_session:
        validate_session(mock_request, db_session)
        mock_clear_session.assert_called()
