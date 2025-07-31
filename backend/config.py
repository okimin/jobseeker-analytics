import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict, NoDecode
from typing import List
from typing_extensions import Annotated
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    GOOGLE_CLIENT_ID: str = "default-for-local"
    GOOGLE_CLIENT_SECRET: str = "default-for-local"
    REDIRECT_URI: str = "http://localhost:3000/login"
    GOOGLE_API_KEY: str
    COOKIE_SECRET: str
    ENV: str = "dev"
    APP_URL: str = "http://localhost:3000"  # Frontend URL - default for local dev
    API_URL: str = "http://localhost:8000"  # Backend API URL - default for local dev
    GOOGLE_CLIENT_REDIRECT_URI: Annotated[List[str], NoDecode] = '["http://localhost:8000/login"]'
    GOOGLE_SCOPES: Annotated[List[str], NoDecode] = '["https://www.googleapis.com/auth/gmail.readonly", "openid", "https://www.googleapis.com/auth/userinfo.email"]'
    ORIGIN: str = "localhost"  # Default for local dev
    DATABASE_URL: str = "default-for-local"
    DATABASE_URL_LOCAL_VIRTUAL_ENV: str = (
        "postgresql://postgres:postgres@localhost:5433/jobseeker_analytics"
    )
    DATABASE_URL_DOCKER: str = (
        "postgresql://postgres:postgres@db:5432/jobseeker_analytics"
    )
    BATCH_SIZE: int = 40

    @field_validator("GOOGLE_SCOPES", mode="before")
    @classmethod
    def decode_scopes(cls, v: str) -> List[str]:
        logger.info("Decoded scopes from string: %s", json.loads(v.strip("'\"")))
        return json.loads(v.strip("'\""))
    
    @field_validator("GOOGLE_CLIENT_REDIRECT_URI", mode="before")
    @classmethod
    def decode_redirect_uri(cls, v: str) -> List[str]:
        logger.info("Decoded redirect URIs from string: %s", json.loads(v.strip("'\"")))
        return json.loads(v.strip("'\""))

    @property
    def is_publicly_deployed(self) -> bool:
        return self.ENV in ["prod", "staging"]
    
    @property
    def batch_size_by_env(self) -> int:
        return self.BATCH_SIZE if self.is_publicly_deployed else 200  # corresponds to Gemini API rate limit per day (200) / number of Daily Active Users (DAU) ~5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")


settings = Settings(_env_file=".env", _env_file_encoding="utf-8")
