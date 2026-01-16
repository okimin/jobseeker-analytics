from unittest import mock
from fastapi import Request
from sqlmodel import select

from db import processing_tasks as task_models
from routes.email_routes import fetch_emails_to_db


def test_processing(logged_in_client, started_task):
    # make request to check on processing status
    resp = logged_in_client.get("/processing", follow_redirects=False)
    # assert response
    assert resp.status_code == 200, resp.headers
    assert resp.json()["processed_emails"] == 0


def test_processing_404(logged_in_client):
    resp = logged_in_client.get("/processing", follow_redirects=False)
    assert resp.status_code == 404


def test_processing_redirect(incognito_client):
    resp = incognito_client.get("/processing", follow_redirects=False)
    assert resp.status_code == 303


def test_fetch_emails_to_db(logged_in_user, db_session, mock_authenticated_user):
    with mock.patch("routes.email_routes.get_email_ids", return_value=[]):
        fetch_emails_to_db(
            mock_authenticated_user,
            Request({"type": "http", "session": {}}),
            user_id=logged_in_user.user_id
        )

        process_task_run: task_models.TaskRuns = db_session.exec(
            select(task_models.TaskRuns).where(
                task_models.TaskRuns.user_id == logged_in_user.user_id,
                task_models.TaskRuns.status == task_models.STARTED
            )
        ).one_or_none()
        assert process_task_run is None


def test_fetch_emails_to_db_in_progress_rate_limited_no_processing(
    logged_in_user, task_with_300_processed_emails, db_session, mock_authenticated_user
):
    with mock.patch(
        "routes.email_routes.get_email_ids", return_value=[]
    ) as mock_get_email_ids:
        fetch_emails_to_db(
            mock_authenticated_user,
            Request({"type": "http", "session": {}}),
            user_id=logged_in_user.user_id
        )

        mock_get_email_ids.assert_not_called()
        # Re-fetch the task from the db to ensure we have the latest state
        process_task_run: task_models.TaskRuns = db_session.exec(
            select(task_models.TaskRuns).where(
                task_models.TaskRuns.user_id == logged_in_user.user_id,
                task_models.TaskRuns.status == task_models.CANCELLED
            )
        ).one_or_none()
        assert process_task_run is not None
