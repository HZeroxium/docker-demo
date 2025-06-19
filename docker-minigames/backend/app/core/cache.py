# app/core/cache.py

import json
import logging
from typing import Optional, Any
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.is_connected = False

    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_connection_string,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30,
            )

            # Test connection
            await self.redis_client.ping()
            self.is_connected = True
            logger.info("✅ Redis connection established successfully")

        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}")
            logger.warning("🔄 Application will continue without caching")
            self.is_connected = False
            self.redis_client = None

    async def disconnect(self):
        """Close Redis connection"""
        if self.redis_client:
            try:
                await self.redis_client.close()
                logger.info("✅ Redis connection closed")
            except Exception as e:
                logger.error(f"❌ Error closing Redis connection: {e}")

        self.is_connected = False
        self.redis_client = None

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_connected or not self.redis_client:
            return None

        try:
            cached_value = await self.redis_client.get(key)
            if cached_value:
                return json.loads(cached_value)
            return None
        except Exception as e:
            logger.error(f"❌ Cache GET error for key '{key}': {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.is_connected or not self.redis_client:
            return False

        try:
            ttl = ttl or settings.CACHE_TTL
            serialized_value = json.dumps(value, default=str)
            await self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"❌ Cache SET error for key '{key}': {e}")
            return False

    async def delete(self, *keys: str) -> int:
        """Delete keys from cache"""
        if not self.is_connected or not self.redis_client or not keys:
            return 0

        try:
            return await self.redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"❌ Cache DELETE error for keys {keys}: {e}")
            return 0

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.is_connected or not self.redis_client:
            return 0

        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"❌ Cache DELETE_PATTERN error for pattern '{pattern}': {e}")
            return 0

    async def invalidate_questions_cache(self):
        """Invalidate all question-related cache entries"""
        patterns = [
            "questions:*",
            "random_questions:*",
            "question_count",
        ]

        deleted_count = 0
        for pattern in patterns:
            deleted_count += await self.delete_pattern(pattern)

        if deleted_count > 0:
            logger.info(f"🗑️ Invalidated {deleted_count} question cache entries")

        return deleted_count

    def get_questions_cache_key(self, limit: int = None, skip: int = None) -> str:
        """Generate cache key for questions list"""
        return f"questions:list:limit_{limit}:skip_{skip}"

    def get_question_cache_key(self, question_id: str) -> str:
        """Generate cache key for single question"""
        return f"questions:single:{question_id}"

    def get_random_questions_cache_key(self, count: int) -> str:
        """Generate cache key for random questions"""
        return f"random_questions:{count}"


# Global cache service instance
cache_service = CacheService()
