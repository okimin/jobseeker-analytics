"""Fernet-based encryption utilities for OAuth token storage.

Uses symmetric encryption with a key from TOKEN_ENCRYPTION_KEY environment variable.
Fernet guarantees that tokens encrypted with it cannot be manipulated or read without the key.
"""

import logging
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from utils.config_utils import get_settings

logger = logging.getLogger(__name__)


class EncryptionError(Exception):
    """Raised when encryption or decryption fails."""

    pass


@lru_cache
def _get_fernet() -> Fernet:
    """Get cached Fernet instance.

    The TOKEN_ENCRYPTION_KEY must be a 32-byte URL-safe base64-encoded key.
    Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    """
    settings = get_settings()
    key = settings.TOKEN_ENCRYPTION_KEY

    if key == "default-for-local":
        # Fail fast in production - encryption key must be explicitly set
        if settings.is_publicly_deployed:
            raise EncryptionError(
                "TOKEN_ENCRYPTION_KEY must be set in production. "
                "Generate with: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
            )
        # Generate a deterministic key for local development only
        logger.warning("Using default encryption key - NOT FOR PRODUCTION USE")
        # Use a fixed key for local dev so tokens remain decryptable across restarts
        key = "local-dev-key-not-for-production-use="
        # Pad to 32 bytes and base64 encode for Fernet
        import base64

        key = base64.urlsafe_b64encode(key.encode()[:32].ljust(32, b"=")).decode()

    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception as e:
        logger.error("Invalid TOKEN_ENCRYPTION_KEY format: %s", e)
        raise EncryptionError("Invalid encryption key configuration")


def encrypt_token(plaintext: str) -> str:
    """Encrypt a token string.

    Args:
        plaintext: The token to encrypt

    Returns:
        Base64-encoded encrypted token

    Raises:
        EncryptionError: If encryption fails
    """
    if not plaintext:
        raise EncryptionError("Cannot encrypt empty token")

    try:
        fernet = _get_fernet()
        encrypted = fernet.encrypt(plaintext.encode("utf-8"))
        return encrypted.decode("utf-8")
    except EncryptionError:
        raise
    except Exception as e:
        logger.error("Encryption failed: %s", type(e).__name__)
        raise EncryptionError("Failed to encrypt token")


def decrypt_token(ciphertext: str) -> str:
    """Decrypt an encrypted token.

    Args:
        ciphertext: Base64-encoded encrypted token

    Returns:
        Decrypted token string

    Raises:
        EncryptionError: If decryption fails (invalid key, corrupted data, etc.)
    """
    if not ciphertext:
        raise EncryptionError("Cannot decrypt empty ciphertext")

    try:
        fernet = _get_fernet()
        decrypted = fernet.decrypt(ciphertext.encode("utf-8"))
        return decrypted.decode("utf-8")
    except InvalidToken:
        logger.error("Decryption failed: invalid token or wrong key")
        raise EncryptionError("Failed to decrypt token - invalid key or corrupted data")
    except EncryptionError:
        raise
    except Exception as e:
        logger.error("Decryption failed: %s", type(e).__name__)
        raise EncryptionError("Failed to decrypt token")
