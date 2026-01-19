from session.session_layer import validate_session
from datetime import datetime, timedelta, timezone
from unittest import mock

def test_inactive_user_clears_session(inactive_user, mock_request, db_session):
    # Simulate session data for inactive user
    session_id = "test_session_id"
    session_dict = {
        "session_id": session_id,
        "access_token": "test_access_token",
        "token_expiry": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),  # valid
        "user_id": inactive_user.user_id,
        "user_email": inactive_user.user_email,
    }
    mock_request.session = mock.MagicMock()
    mock_request.session.get = lambda key: session_dict.get(key)
    mock_request.cookies = {"Authorization": session_id, "__Secure-Authorization": session_id}

    result = validate_session(mock_request, db_session)
    # validate_session returns empty string for inactive users
    assert result == ""
    # validate_session clears the session directly (not via clear_session since Response not available)
    mock_request.session.clear.assert_called_once()
