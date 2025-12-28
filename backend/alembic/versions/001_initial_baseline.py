"""initial baseline

Revision ID: 001_initial_baseline
Revises: 
Create Date: 2024-05-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from utils.config_utils import get_settings

# revision identifiers, used by Alembic.
revision = '001_initial_baseline'
down_revision = None
branch_labels = None
depends_on = None

settings = get_settings()

def upgrade() -> None:
    # Get the database connection
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()
    # adding "if" statements to make this crash proof in prod. 
    # migration history is corrupted because I didn't know how to use alembic :)
    # Users Table
    if 'users' not in existing_tables:
        op.create_table('users',
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('user_email', sa.String(), nullable=False),
            sa.Column('start_date', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('user_id')
        )
        op.create_index(op.f('ix_users_user_email'), 'users', ['user_email'], unique=False)

    # User Emails Table (Composite Key)
    if 'user_emails' not in existing_tables:
        op.create_table('user_emails',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('company_name', sa.String(), nullable=False),
            sa.Column('application_status', sa.String(), nullable=False),
            sa.Column('received_at', sa.DateTime(), nullable=False),
            sa.Column('subject', sa.String(), nullable=False),
            sa.Column('job_title', sa.String(), nullable=False),
            sa.Column('normalized_job_title', sa.String(), nullable=False, server_default=''),
            sa.Column('email_from', sa.String(), nullable=False),
            sa.PrimaryKeyConstraint('id', 'user_id')
        )

    # Task Runs Table
    if 'processing_task_runs' not in existing_tables:
        op.create_table('processing_task_runs',
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('created', sa.DateTime(), nullable=False),
            sa.Column('updated', sa.DateTime(), nullable=False),
            sa.Column('status', sa.String(), nullable=False),
            sa.Column('total_emails', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('processed_emails', sa.Integer(), nullable=False, server_default='0'),
            sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
            sa.PrimaryKeyConstraint('user_id')
        )


def downgrade() -> None:
    # dont want to drop existing prod tables
    if settings.is_publicly_deployed:
        print(f"Skipping downgrade in {settings.ENV} environment.")
        return
    print("dropping tables!")
    op.drop_table('processing_task_runs')
    op.drop_table('user_emails')
    op.drop_table('users')
    op.drop_table('companies')