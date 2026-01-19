from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional
import uuid


class PaymentAsks(SQLModel, table=True):
    """Tracks when payment modals are shown and user responses."""

    __tablename__ = "payment_asks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.user_id", nullable=False, index=True)

    # What triggered showing the payment ask
    trigger_type: str = Field(nullable=False)  # 'post_processing', 'day_7', 'milestone', 'return_visit'
    trigger_value: Optional[str] = Field(default=None, nullable=True)  # e.g., '25' for 25 applications

    # When the modal was shown
    shown_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    # User's response
    action: Optional[str] = Field(default=None, nullable=True)  # 'skipped', 'maybe_later', 'selected'
    selected_amount_cents: Optional[int] = Field(default=None, nullable=True)
    action_at: Optional[datetime] = Field(default=None, nullable=True)
