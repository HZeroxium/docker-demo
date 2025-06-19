# app/core/config.py

import os
from typing import Optional


class Settings:
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL", "mongodb://localhost:27017/docker_quiz_game"
    )
    DB_NAME: str = os.getenv("DB_NAME", "docker_quiz_game")
    MONGODB_TIMEOUT: int = int(os.getenv("MONGODB_TIMEOUT", "10000"))
    MONGODB_POOL_SIZE: int = int(os.getenv("MONGODB_POOL_SIZE", "10"))

    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")

    # Cache Configuration
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default
    QUESTIONS_CACHE_TTL: int = int(
        os.getenv("QUESTIONS_CACHE_TTL", "7200")
    )  # 2 hours for questions

    # Admin Configuration
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "your-secure-admin-key-here")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def redis_connection_string(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL

        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        else:
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


settings = Settings()
