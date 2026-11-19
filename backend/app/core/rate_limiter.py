"""
TRIO Rate Limiter — Distributed Sliding-Window Algorithm
Implements genuine distributed sliding-window rate limiting:
1. Atomic Redis Lua script (ZSET) for multi-worker production environments.
   Eliminates race conditions between removal, counting, insertion, and expiration.
2. Thread-safe In-Memory deque with timestamps for local development fallback.
Includes automatic failover to in-memory on Redis disconnect, and seamless recovery.
"""

import os
import time
import logging
import uuid
import threading
from typing import Tuple, Dict, Deque
from collections import defaultdict, deque

logger = logging.getLogger("trio.rate_limiter")

REDIS_URL = os.environ.get("REDIS_URL", "")

_redis_client = None
_redis_available = False

# ---------------------------------------------------------------------------
# Atomic Redis Lua Script for Sliding Window (Authoritative Redis Server Clock)
# ---------------------------------------------------------------------------
# KEYS[1]: rate limit key, e.g. "trio:rl:login:127.0.0.1"
# ARGV[1]: window_seconds (number)
# ARGV[2]: max_requests (number)
# ARGV[3]: request nonce (string, e.g. uuid hex)
#
# Clock source: Authoritative Redis TIME (seconds + microseconds)
# Member uniqueness: "{now_sec}.{now_usec}:{nonce}"
#
# Returns table: {allowed (1 or 0), remaining (integer), reset_after_seconds (integer)}

LUA_SLIDING_WINDOW = """
local key = KEYS[1]
local window = tonumber(ARGV[1])
local max_req = tonumber(ARGV[2])
local req_nonce = ARGV[3]

-- Authoritative Redis server clock (eliminates application-server clock drift)
local redis_time = redis.call('TIME')
local now_sec = tonumber(redis_time[1])
local now_usec = tonumber(redis_time[2])
local now = now_sec + (now_usec / 1000000.0)
local threshold = now - window
local member = tostring(now_sec) .. "." .. tostring(now_usec) .. ":" .. req_nonce

-- Step 1: Atomically prune expired entries outside sliding window
redis.call('ZREMRANGEBYSCORE', key, '-inf', threshold)

-- Step 2: Count entries currently in the active sliding window
local count = redis.call('ZCARD', key)

-- Step 3: Compute exact retry_after from earliest element in current window
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local reset_after = 1
if oldest and #oldest >= 2 then
    local oldest_ts = tonumber(oldest[2])
    reset_after = math.max(1, math.ceil(oldest_ts + window - now))
else
    reset_after = math.max(1, math.ceil(window))
end

if count < max_req then
    -- Allowed: atomically record entry with Redis server timestamp and refresh TTL
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, math.ceil(window + 5))
    local remaining = max_req - (count + 1)
    return {1, remaining, reset_after}
else
    -- Blocked: do not record, return accurate reset_after
    return {0, 0, reset_after}
end
"""


def _init_redis():
    """Lazy-initialize Redis client if REDIS_URL is configured."""
    global _redis_client, _redis_available
    if _redis_client is not None:
        return
    if not REDIS_URL:
        _redis_available = False
        return
    try:
        import redis
        _redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=2)
        _redis_client.ping()
        _redis_available = True
        logger.info(
            "Redis connected for atomic Lua sliding-window rate limiting: %s",
            REDIS_URL.split("@")[-1] if "@" in REDIS_URL else REDIS_URL
        )
    except Exception as e:
        logger.warning("Redis unavailable, falling back to in-memory sliding window: %s", e)
        _redis_available = False


# ---------------------------------------------------------------------------
# Thread-safe in-memory sliding window fallback (per-key timestamp queue)
# ---------------------------------------------------------------------------

_memory_lock = threading.Lock()
_memory_store: Dict[str, Deque[float]] = defaultdict(deque)


def _check_memory(key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int, int]:
    """
    Thread-safe genuine sliding window algorithm in memory.
    Each key holds a deque of float timestamps representing recent requests.
    Guarantees strict atomicity under multi-threaded concurrency.
    """
    with _memory_lock:
        now = time.time()
        q = _memory_store[key]

        # Prune timestamps older than (now - window_seconds)
        threshold = now - window_seconds
        while q and q[0] <= threshold:
            q.popleft()

        count = len(q)
        if count < max_requests:
            q.append(now)
            remaining = max_requests - (count + 1)
            oldest = q[0]
            reset_after = max(1, int(oldest + window_seconds - now))
            return True, remaining, reset_after
        else:
            # Rate limit exceeded: rejected
            remaining = 0
            oldest = q[0]
            reset_after = max(1, int(oldest + window_seconds - now))
            return False, remaining, reset_after


# ---------------------------------------------------------------------------
# Redis distributed sliding window (atomic Lua script)
# ---------------------------------------------------------------------------

def _check_redis(key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int, int]:
    """
    Atomic distributed sliding-window rate limiting executed via Redis Lua script.
    Uses Redis TIME inside the Lua script as authoritative clock (immune to server clock drift).
    Guarantees strict atomicity and drift-free execution across horizontal backend workers.
    """
    global _redis_available
    try:
        redis_key = f"trio:rl:{key}"
        req_nonce = uuid.uuid4().hex[:12]

        # Execute Lua script atomically on Redis server using Redis TIME
        res = _redis_client.eval(
            LUA_SLIDING_WINDOW,
            1,
            redis_key,
            str(window_seconds),
            str(max_requests),
            req_nonce
        )

        allowed = bool(res[0] == 1)
        remaining = int(res[1])
        reset_after = int(res[2])
        return allowed, remaining, reset_after

    except Exception as e:
        logger.warning("Redis Lua sliding window check failed (%s), failing over to in-memory limiter", e)
        # Graceful failover to memory limiter if Redis fails midway
        return _check_memory(key, max_requests, window_seconds)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_rate_limit(
    key: str,
    max_requests: int = 5,
    window_seconds: int = 60,
) -> Tuple[bool, int, int]:
    """
    Check whether a request identified by `key` is within sliding-window rate limits.

    Args:
        key: Unique identifier (e.g., 'login:192.168.1.1' or 'reset:user@example.com')
        max_requests: Maximum allowed requests in the sliding window
        window_seconds: Sliding window duration in seconds

    Returns:
        Tuple of (allowed: bool, remaining: int, reset_after_seconds: int)
    """
    _init_redis()

    if _redis_available:
        return _check_redis(key, max_requests, window_seconds)
    else:
        return _check_memory(key, max_requests, window_seconds)


def is_redis_available() -> bool:
    """Check if Redis is connected and available."""
    _init_redis()
    return _redis_available


def get_rate_limiter_info() -> dict:
    """Return current rate limiter backend info."""
    _init_redis()
    return {
        "backend": "redis_distributed_sliding_window_lua" if _redis_available else "in_memory_sliding_window",
        "redis_url_configured": bool(REDIS_URL),
        "redis_connected": _redis_available,
        "algorithm": "atomic_lua_sliding_window_zset" if _redis_available else "thread_safe_sliding_window_deque",
        "clock_source": "redis_server_time" if _redis_available else "system_time"
    }


def reset_rate_limiter_memory():
    """Clear in-memory rate limiting queues (useful for testing)."""
    with _memory_lock:
        _memory_store.clear()
