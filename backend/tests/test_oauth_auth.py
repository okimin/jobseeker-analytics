from unittest.mock import Mock
import pytest
from utils.auth_utils import get_google_authorization_url


@pytest.mark.parametrize(
    "has_valid_creds,expected_prompt",
    [
        (False, "consent"),
        (True, "select_account"),
    ],
)
def test_oauth_prompt_based_on_user_type(has_valid_creds, expected_prompt):
    """OAuth flow uses appropriate prompt based on whether user has valid credentials."""
    mock_flow = Mock()
    mock_flow.authorization_url.return_value = ("https://google.com/auth", "state")

    get_google_authorization_url(mock_flow, has_valid_creds=has_valid_creds)

    mock_flow.authorization_url.assert_called_once_with(
        access_type="offline",
        # 'consent': Forces full consent screen, guarantees refresh token (new users)
        # 'select_account': Just account picker, skips consent if already granted (returning users)
        prompt=expected_prompt,
    )
