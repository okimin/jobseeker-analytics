"""enforce one STARTED task per user, allow multiple otherwise

Revision ID: bcbdf2457f3a
Revises: 54442024f29b
Create Date: 2026-01-05 04:34:01.537671

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bcbdf2457f3a'
down_revision: Union[str, None] = '54442024f29b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Manual adjustment to correctly change the primary key for processing_task_runs
    
    # Step 1: Add the 'id' column as nullable
    op.add_column('processing_task_runs', sa.Column('id', sa.Integer(), nullable=True))

    # Step 2: Populate the 'id' column with unique values for existing rows
    op.execute("""
        CREATE SEQUENCE processing_task_runs_id_seq;
        UPDATE processing_task_runs SET id = nextval('processing_task_runs_id_seq');
    """)

    # Step 3: Make the 'id' column not nullable
    op.alter_column('processing_task_runs', 'id', nullable=False)

    # Step 4: Drop the old primary key on 'user_id'
    op.drop_constraint('processing_task_runs_pkey', 'processing_task_runs', type_='primary')
    
    # Step 5: Create a new primary key on the 'id' column
    op.create_primary_key('processing_task_runs_pkey', 'processing_task_runs', ['id'])

    # Step 6: Create the desired indexes
    op.create_index(op.f('ix_processing_task_runs_user_id'), 'processing_task_runs', ['user_id'], unique=False)
    op.create_index('ix_user_id_status_started_unique', 'processing_task_runs', ['user_id'], unique=True, postgresql_where=sa.text("status = 'started'"))


def downgrade() -> None:
    """Downgrade schema."""
    # Reverse the operations from upgrade
    
    op.drop_index('ix_user_id_status_started_unique', table_name='processing_task_runs', postgresql_where=sa.text("status = 'started'"))
    op.drop_index(op.f('ix_processing_task_runs_user_id'), table_name='processing_task_runs')

    # Drop the new primary key on 'id'
    op.drop_constraint('processing_task_runs_pkey', 'processing_task_runs', type_='primary')

    # Re-create the original primary key on 'user_id'
    op.create_primary_key('processing_task_runs_pkey', 'processing_task_runs', ['user_id'])
    
    op.drop_column('processing_task_runs', 'id')
    
    op.execute('DROP SEQUENCE processing_task_runs_id_seq')