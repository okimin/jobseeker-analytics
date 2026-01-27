"""add applications_found to processing_task_runs

Revision ID: add_applications_found
Revises: create_oauth_credentials
Create Date: 2026-01-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_applications_found'
down_revision: Union[str, None] = 'create_oauth_credentials'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add applications_found column to processing_task_runs table."""
    op.add_column('processing_task_runs', sa.Column(
        'applications_found',
        sa.Integer(),
        nullable=False,
        server_default='0'
    ))


def downgrade() -> None:
    """Remove applications_found column from processing_task_runs table."""
    op.drop_column('processing_task_runs', 'applications_found')
