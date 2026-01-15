"""set_default_for_processing_task_runs_id

Revision ID: 3e6be37630d4
Revises: 20e8589cda40
Create Date: 2026-01-06 00:38:54.424789

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e6be37630d4'
down_revision: Union[str, None] = '20e8589cda40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE processing_task_runs ALTER COLUMN id SET DEFAULT nextval('processing_task_runs_id_seq')")
    op.execute("ALTER SEQUENCE processing_task_runs_id_seq OWNED BY processing_task_runs.id")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE processing_task_runs ALTER COLUMN id DROP DEFAULT")
    op.execute("ALTER SEQUENCE processing_task_runs_id_seq OWNED BY NONE")