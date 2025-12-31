from db.utils.user_utils import user_exists

def test_inactive_user_attribute_is_returned(inactive_user, db_session):
    user_object, _ = user_exists(inactive_user, db_session)
    assert not user_object.is_active

def test_active_user_attribute_is_returned(logged_in_user, db_session):
    user_object, _ = user_exists(logged_in_user, db_session)
    assert user_object.is_active

