"""create oauth_credentials table for encrypted token storage

Revision ID: create_oauth_credentials
Revises: create_contributions
Create Date: 2026-01-22

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "create_oauth_credentials"
down_revision: Union[str, None] = "add_timezone_to_timestamps"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create oauth_credentials table for encrypted token storage."""
    op.create_table(
        "oauth_credentials",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("credential_type", sa.String(20), nullable=False),
        sa.Column("encrypted_refresh_token", sa.Text(), nullable=False),
        sa.Column("encrypted_access_token", sa.Text(), nullable=False),
        sa.Column("token_expiry", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scopes", sa.Text(), nullable=False),  # JSON array
        sa.Column("client_id", sa.String(255), nullable=False),
        sa.Column(
            "token_uri",
            sa.String(255),
            server_default="https://oauth2.googleapis.com/token",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "credential_type", name="uq_user_credential_type"),
    )

    # Create indexes for efficient queries
    op.create_index("idx_oauth_credentials_user", "oauth_credentials", ["user_id"])
    op.create_index(
        "idx_oauth_credentials_type", "oauth_credentials", ["credential_type"]
    )
    op.create_index(
        "idx_oauth_credentials_expiry", "oauth_credentials", ["token_expiry"]
    )


def downgrade() -> None:
    """Drop oauth_credentials table."""
    op.drop_index("idx_oauth_credentials_expiry", table_name="oauth_credentials")
    op.drop_index("idx_oauth_credentials_type", table_name="oauth_credentials")
    op.drop_index("idx_oauth_credentials_user", table_name="oauth_credentials")
    op.drop_table("oauth_credentials")
