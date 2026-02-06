"""add always_open fields for background sync

Revision ID: add_always_open_fields
Revises: add_applications_found
Create Date: 2026-02-03

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "add_always_open_fields"
down_revision: Union[str, None] = "add_applications_found"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add always_open fields to users table for background sync feature."""

    # Add sync_tier for tiered scheduling (none/premium)
    op.add_column(
        "users",
        sa.Column(
            "sync_tier",
            sa.String(20),
            nullable=False,
            server_default="none",
        ),
    )

    # Add last_background_sync_at timestamp
    op.add_column(
        "users",
        sa.Column(
            "last_background_sync_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Create index on sync_tier for efficient batch queries
    op.create_index(
        "idx_users_sync_tier",
        "users",
        ["sync_tier"],
        postgresql_where=sa.text("sync_tier = 'premium'"),
    )

    # Set existing active users to onboarding_completed_at = now
    # This ensures existing beta users are not forced into the new onboarding flow
    print("Setting sync_tier = premium for all existing users with active coach link")
    op.execute(sa.text("UPDATE users SET sync_tier = 'premium' WHERE user_id in (" \
    "select client_id from coach_client_link where end_date is null)"))

    # Drop payment_asks table - no longer used
    op.drop_index("idx_payment_asks_user_shown", table_name="payment_asks")
    op.drop_table("payment_asks")



def downgrade() -> None:
    """Remove background sync fields from users table."""
    # Recreate payment_asks table
    op.create_table(
        "payment_asks",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("trigger_type", sa.String(100), nullable=False),
        sa.Column("trigger_value", sa.String(255), nullable=True),
        sa.Column("shown_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("action", sa.String(50), nullable=True),
        sa.Column("selected_amount_cents", sa.Integer(), nullable=True),
        sa.Column("action_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_payment_asks_user_shown", "payment_asks", ["user_id", "shown_at"])

    op.drop_index("idx_users_sync_tier", table_name="users")
    op.drop_column("users", "last_background_sync_at")
    op.drop_column("users", "sync_tier")
