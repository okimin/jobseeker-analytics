"""create contributions table

Revision ID: create_contributions
Revises: create_payment_asks
Create Date: 2026-01-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'create_contributions'
down_revision: Union[str, None] = 'create_payment_asks'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create contributions table for tracking payment history."""
    op.create_table(
        'contributions',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),
        sa.Column('amount_cents', sa.Integer(), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),  # 'pending', 'completed', 'failed', 'cancelled'
        sa.Column('trigger_type', sa.String(100), nullable=True),  # What triggered this payment
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for efficient queries
    op.create_index('idx_contributions_user', 'contributions', ['user_id'])
    op.create_index('idx_contributions_status', 'contributions', ['status'])


def downgrade() -> None:
    """Drop contributions table."""
    op.drop_index('idx_contributions_status', table_name='contributions')
    op.drop_index('idx_contributions_user', table_name='contributions')
    op.drop_table('contributions')
