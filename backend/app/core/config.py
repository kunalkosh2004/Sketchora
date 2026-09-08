"""Application configuration.

All values come from environment variables (or a root `.env` file). Secrets
never appear in code or logs; nothing is hard-coded beyond safe dev defaults.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Sketchora API"
    environment: str = "development"
    debug: bool = False

    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    database_url: str = (
        "postgresql+psycopg://sketchora:sketchora@localhost:5432/sketchora"
    )
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    storage_driver: str = "local"
    storage_dir: str = "./var/storage"

    # AI providers — optional until the AI phases land.
    google_api_key: str | None = None
    openai_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()