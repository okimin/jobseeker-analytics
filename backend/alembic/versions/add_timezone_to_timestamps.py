"""add timezone to timestamp columns

Revision ID: add_timezone_to_timestamps
Revises: create_contributions
Create Date: 2026-01-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_timezone_to_timestamps'
down_revision: Union[str, None] = 'create_contributions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert timestamp columns to timezone-aware (TIMESTAMP WITH TIME ZONE)."""
    # processing_task_runs table
    op.alter_column(
        'processing_task_runs',
        'created',
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=False
    )
    op.alter_column(
        'processing_task_runs',
        'updated',
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=False
    )


def downgrade() -> None:
    """Revert to timezone-naive timestamps."""
    op.alter_column(
        'processing_task_runs',
        'created',
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False
    )
    op.alter_column(
        'processing_task_runs',
        'updated',
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False
    )
