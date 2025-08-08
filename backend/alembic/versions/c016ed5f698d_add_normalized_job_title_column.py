"""add_normalized_job_title_column

Revision ID: c016ed5f698d
Revises: c256d0279ea6
Create Date: 2025-08-06 00:00:24.368750

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c016ed5f698d'
down_revision: Union[str, None] = 'c256d0279ea6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add normalized_job_title column to user_emails table."""
    op.add_column('user_emails', sa.Column('normalized_job_title', sa.String(255), nullable=True, default=''))


def downgrade() -> None:
    """Remove normalized_job_title column from user_emails table."""
    op.drop_column('user_emails', 'normalized_job_title')
