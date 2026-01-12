from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import uuid

class UserData(BaseModel):
    user_id: str
    user_email: str
    start_date: datetime

class Users(SQLModel, table=True):
    __tablename__ = "users"
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key = True)
    user_email: str = Field(nullable=False)
    start_date: datetime = Field(nullable=True) # Start date for job applications
    # Billing fields
    is_active: bool = Field(default=False, nullable=False)
    stripe_customer_id: str | None = Field(default=None, nullable=True)
    # Add role field to distinguish generic users from coaches
    role: str = Field(default="jobseeker") # 'jobseeker', 'coach'
    # Onboarding fields
    has_completed_onboarding: bool = Field(default=False, nullable=False)
    subscription_tier: str | None = Field(default=None, nullable=True)  # "subsidized", "standard", "sustainer", "custom"
    # Email sync fields (separate from signup auth)
    has_email_sync_configured: bool = Field(default=False, nullable=False)
    sync_email_address: str | None = Field(default=None, nullable=True)  # Email address being synced (can differ from user_email)

class CoachClientLink(SQLModel, table=True):
    __tablename__ = "coach_client_link"
    coach_id: str = Field(foreign_key="users.user_id", primary_key=True)
    client_id: str = Field(foreign_key="users.user_id", primary_key=True)
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # If NULL, the relationship is currently active.
    end_date: Optional[datetime] = Field(default=None, nullable=True)
    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated: datetime = Field(
        sa_column_kwargs={"onupdate": sa.func.now()},
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )