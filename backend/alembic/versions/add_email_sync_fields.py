"""add email sync fields

Revision ID: add_email_sync_fields
Revises: add_onboarding_fields
Create Date: 2026-01-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'add_email_sync_fields'
down_revision: Union[str, None] = 'add_onboarding_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add has_email_sync_configured with default False for new users
    op.add_column('users', sa.Column(
        'has_email_sync_configured',
        sa.Boolean(),
        nullable=False,
        server_default=sa.text('false')
    ))

    # Add sync_email_address as nullable string (can differ from user_email)
    op.add_column('users', sa.Column(
        'sync_email_address',
        sqlmodel.sql.sqltypes.AutoString(),
        nullable=True
    ))

    # Set existing users with completed onboarding to has_email_sync_configured = true
    # This ensures existing beta users are not forced into the new email sync setup flow
    # Their sync_email_address will be their user_email (the account they signed up with)
    print("Setting has_email_sync_configured = true for all existing onboarded users")
    op.execute(text("""
        UPDATE users
        SET has_email_sync_configured = true,
            sync_email_address = user_email
        WHERE onboarding_completed_at IS NOT NULL
    """))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'sync_email_address')
    op.drop_column('users', 'has_email_sync_configured')
