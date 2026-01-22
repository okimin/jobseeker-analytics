from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import uuid
import sqlalchemy as sa


class OAuthCredentials(SQLModel, table=True):
    """Encrypted OAuth credentials for persistent token storage.

    Stores encrypted refresh and access tokens to enable:
    - Background email sync tasks that survive session expiration
    - Proactive token refresh when tokens are near expiry
    """

    __tablename__ = "oauth_credentials"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.user_id", nullable=False, index=True)

    # Credential type: 'primary' (login account) or 'email_sync' (can be different account)
    credential_type: str = Field(nullable=False)

    # Encrypted tokens (Fernet symmetric encryption)
    encrypted_refresh_token: str = Field(nullable=False)
    encrypted_access_token: str = Field(nullable=False)

    # Token metadata (not encrypted - needed for refresh logic)
    token_expiry: datetime = Field(nullable=False)
    scopes: str = Field(nullable=False)  # JSON array of scopes

    # Google OAuth metadata
    client_id: str = Field(nullable=False)
    token_uri: str = Field(
        default="https://oauth2.googleapis.com/token", nullable=False
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        sa_column_kwargs={"onupdate": sa.func.now()},
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Composite unique constraint: one credential per user per type
    __table_args__ = (
        sa.UniqueConstraint(
            "user_id", "credential_type", name="uq_user_credential_type"
        ),
    )
