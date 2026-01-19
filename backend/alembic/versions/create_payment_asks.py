"""create payment_asks table

Revision ID: create_payment_asks
Revises: add_contribution_fields
Create Date: 2026-01-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'create_payment_asks'
down_revision: Union[str, None] = 'add_contribution_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create payment_asks table for tracking payment modal interactions."""
    op.create_table(
        'payment_asks',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('trigger_type', sa.String(100), nullable=False),  # 'post_processing', 'day_7', 'milestone'
        sa.Column('trigger_value', sa.String(255), nullable=True),  # e.g., '25' for 25 applications
        sa.Column('shown_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('action', sa.String(50), nullable=True),  # 'skipped', 'maybe_later', 'selected'
        sa.Column('selected_amount_cents', sa.Integer(), nullable=True),
        sa.Column('action_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index for efficient queries by user and time
    op.create_index('idx_payment_asks_user_shown', 'payment_asks', ['user_id', 'shown_at'])


def downgrade() -> None:
    """Drop payment_asks table."""
    op.drop_index('idx_payment_asks_user_shown', table_name='payment_asks')
    op.drop_table('payment_asks')
