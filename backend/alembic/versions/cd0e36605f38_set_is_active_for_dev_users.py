"""set_is_active_for_dev_users

Revision ID: cd0e36605f38
Revises: 79b431f2e2f8
Create Date: 2025-12-27 22:56:15.587509

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text # Import text for raw SQL
from utils.config_utils import get_settings


# revision identifiers, used by Alembic.
revision: str = 'cd0e36605f38'
down_revision: Union[str, None] = '79b431f2e2f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

settings = get_settings()

def upgrade() -> None:
    """Upgrade schema."""
    # Only run this data migration in non-production environments
    if not settings.is_publicly_deployed:
        print(f"Applying data migration: Setting all users to active in {settings.ENV} environment.")
        op.execute(text("UPDATE users SET is_active = TRUE"))
    else:
        print(f"Skipping data migration: Not applying in publicly deployed environment ({settings.ENV}).")


def downgrade() -> None:
    """Downgrade schema."""
    # Data downgrades can be tricky. For now, we'll leave this empty
    # as reversing 'is_active = TRUE' might not be desired for dev users.
    pass
