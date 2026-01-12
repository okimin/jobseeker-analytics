"""add onboarding fields

Revision ID: add_onboarding_fields
Revises: b84177e3c1b3
Create Date: 2026-01-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'add_onboarding_fields'
down_revision: Union[str, None] = '3e6be37630d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add has_completed_onboarding with default False for new users
    op.add_column('users', sa.Column(
        'has_completed_onboarding',
        sa.Boolean(),
        nullable=False,
        server_default=sa.text('false')
    ))

    # Add subscription_tier as nullable string
    op.add_column('users', sa.Column(
        'subscription_tier',
        sqlmodel.sql.sqltypes.AutoString(),
        nullable=True
    ))

    # Set existing active users to has_completed_onboarding = true
    # This ensures existing beta users are not forced into the new onboarding flow
    print("Setting has_completed_onboarding = true for all existing active users")
    op.execute(text("UPDATE users SET has_completed_onboarding = true WHERE is_active = true"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'subscription_tier')
    op.drop_column('users', 'has_completed_onboarding')
