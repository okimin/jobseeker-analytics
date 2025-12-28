"""add active beta billing status

Revision ID: 79b431f2e2f8
Revises: 001_initial_baseline
Create Date: 2025-12-28 06:04:10.928352

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '79b431f2e2f8'
down_revision: Union[str, None] = '001_initial_baseline'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')))
    op.add_column('users', sa.Column('stripe_customer_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    # change server default so future users are added as inactive - stripe automation will change this value automatically
    op.alter_column('users', 'server_default', server_default=sa.text('false'))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'is_active')
    # ### end Alembic commands ###
