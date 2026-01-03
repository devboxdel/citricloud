"""
Redis cache configuration
"""
import redis.asyncio as redis
from typing import Optional
from app.core.config import settings

_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """Get Redis client singleton"""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def get_cache(key: str) -> Optional[str]:
    """Get value from cache"""
    if not settings.ENABLE_CACHING:
        return None
    
    client = await get_redis_client()
    return await client.get(key)


async def set_cache(key: str, value: str, ttl: int = None) -> bool:
    """Set value in cache"""
    if not settings.ENABLE_CACHING:
        return False
    
    client = await get_redis_client()
    ttl = ttl or settings.CACHE_TTL
    return await client.setex(key, ttl, value)


async def delete_cache(key: str) -> bool:
    """Delete value from cache"""
    client = await get_redis_client()
    return await client.delete(key) > 0


async def clear_cache_pattern(pattern: str) -> int:
    """Clear cache keys matching pattern"""
    client = await get_redis_client()
    keys = await client.keys(pattern)
    if keys:
        return await client.delete(*keys)
    return 0
