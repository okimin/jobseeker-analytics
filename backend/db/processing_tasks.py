from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone
import sqlalchemy as sa
from sqlalchemy import Index
from db.users import Users

FINISHED = "finished"
STARTED = "started"
CANCELLED = "cancelled"


class TaskRuns(SQLModel, table=True):
    __tablename__ = "processing_task_runs"
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.user_id", index=True)
    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated: datetime = Field(
        sa_column_kwargs={"onupdate": datetime.now(timezone.utc)},
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    status: str = Field(nullable=False)
    total_emails: int = 0
    processed_emails: int = 0

    user: Users = Relationship()

    __table_args__ = (
        Index(
            "ix_user_id_status_started_unique",
            "user_id",
            unique=True,
            postgresql_where=(sa.column("status") == STARTED),
        ),
    )
