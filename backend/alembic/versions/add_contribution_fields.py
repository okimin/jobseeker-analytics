"""add contribution fields to users

Revision ID: add_contribution_fields
Revises: add_email_sync_fields
Create Date: 2026-01-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'add_contribution_fields'
down_revision: Union[str, None] = 'add_email_sync_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add contribution tracking fields to users table."""
    # Monthly contribution amount in cents (0 = free user)
    op.add_column('users', sa.Column(
        'monthly_contribution_cents',
        sa.Integer(),
        nullable=False,
        server_default=sa.text('0')
    ))

    # When the user first started contributing
    op.add_column('users', sa.Column(
        'contribution_started_at',
        sa.DateTime(timezone=True),
        nullable=True
    ))

    # Total amount contributed over lifetime (in cents)
    op.add_column('users', sa.Column(
        'total_contributed_cents',
        sa.Integer(),
        nullable=False,
        server_default=sa.text('0')
    ))

    # When the user completed onboarding (set start date)
    op.add_column('users', sa.Column(
        'onboarding_completed_at',
        sa.DateTime(timezone=True),
        nullable=True
    ))

    # Stripe subscription ID for managing subscriptions
    op.add_column('users', sa.Column(
        'stripe_subscription_id',
        sqlmodel.sql.sqltypes.AutoString(),
        nullable=True
    ))


def downgrade() -> None:
    """Remove contribution tracking fields from users table."""
    op.drop_column('users', 'stripe_subscription_id')
    op.drop_column('users', 'onboarding_completed_at')
    op.drop_column('users', 'total_contributed_cents')
    op.drop_column('users', 'contribution_started_at')
    op.drop_column('users', 'monthly_contribution_cents')
