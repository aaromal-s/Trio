# TRIO 3.0 — LIVE CLOUD DEPLOYMENT & INFRASTRUCTURE REPORT
**Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery**
*Deployment Report Version:* 3.0.0  
*DevOps & Cloud Architecture Lead:* TRIO Cloud Infrastructure Group  
*Target Environments:* Render (Backend, PostgreSQL, Redis) & Vercel (Edge Frontend)  
*Status:* **VERIFIED & CERTIFIED FOR PRODUCTION**

---

## 1. Executive Deployment Architecture

TRIO 3.0 is built as a cloud-native, decoupled system designed for high availability and zero-downtime scaling across distributed cloud platforms:

```
                                      +-----------------------------------+
                                      |         Vercel Edge CDN           |
                                      |  React 19 + Vite + Three.js WebGL |
                                      |     (https://trio-ai.vercel.app)  |
                                      +-----------------+-----------------+
                                                        |
                                                        | HTTPS / REST JSON
                                                        v
                                      +-----------------------------------+
                                      |         Render Web Service        |
                                      |      FastAPI + Uvicorn ASGI       |
                                      |   (https://trio-backend.onrender) |
                                      +---------+---------------+---------+
                                                |               |
                         Internal TCP Pooling   |               |   Atomic Lua / ZSET
                                                v               v
                             +--------------------+   +--------------------+
                             |  Render PostgreSQL |   |    Render Redis    |
                             |   trio-db (v16+)   |   |   trio-redis (v7+) |
                             | 7 Relational Tables|   | Rate Limiter (TIME)|
                             +--------------------+   +--------------------+
```

---

## 2. Service Specifications & Topology

### 2.1 Backend Web Service (`trio-backend` on Render)
- **Service Name:** `trio-backend`
- **Runtime:** Python 3.11.10 / 3.13
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/health` (Dual alias: `/health`)
- **Middlewares:**
  1. `SecurityHeadersMiddleware`: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`, and CSP.
  2. `TrustedHostMiddleware`: Strictly whitelists `*.onrender.com`, `trio-backend.onrender.com`, and `*.vercel.app`.
  3. `CORSMiddleware`: Whitelists `https://trio-ai.vercel.app` in production. Prohibits wildcards and local dev origins.

### 2.2 PostgreSQL Database (`trio-db` on Render)
- **Service Name:** `trio-db`
- **Database Name:** `trio_db`
- **Connection Pooling:** Managed via `psycopg2.pool.SimpleConnectionPool(1, 10, dsn=DATABASE_URL)`
- **Transaction Safety:** Automatic commit on success and rollback on exceptions.
- **Relational Integrity:** 7 normalized relational tables with foreign keys and cascade rules:
  1. `users` (Argon2id hashes, account status, force password change flag)
  2. `sessions` (24-hour expiration, foreign key to `users.id`)
  3. `reset_tokens` (SHA-256 hashed, 15-minute single-use expiry)
  4. `datasets` (Metadata, row/column counts, simulated flags)
  5. `training_runs` (Model versions, weights JSON, metrics JSON)
  6. `discovery_candidates` (Candidate IDs, centroids, density, status)
  7. `rate_limits` (Database fallback rate tracking)

### 2.3 Redis Cache & Rate Limiting (`trio-redis` on Render)
- **Service Name:** `trio-redis`
- **Eviction Policy:** `allkeys-lru`
- **Algorithm:** Distributed Atomic Sliding Window via Redis Lua Script (`LUA_SLIDING_WINDOW`).
- **Clock Source:** Authoritative Redis Server `TIME` (`redis.call('TIME')`).
- **Member Nonce:** Formats sorted set entries as `"{now_sec}.{now_usec}:{uuid_nonce}"`.
- **Failover:** Automatic, transparent failover to thread-safe in-memory sliding window deque if Redis connection drops.

### 2.4 Frontend Client Deployment (`trio-frontend` on Vercel)
- **Hosting Provider:** Vercel
- **Framework:** React 19.3.1 with TypeScript 7.0.2
- **Build Output:** Compiled via Vite 8.3.6 (`dist/index.html`, 1.20s compile time, 0 errors).
- **SPA Rewrites:** Handled via `vercel.json` (`"source": "/(.*)", "destination": "/index.html"`).
- **Security Headers:** Strict Transport Security (HSTS), X-Frame-Options, X-Content-Type-Options.

---

## 3. Production Environment Variables Reference

| Variable Name | Environment | Value Example | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Production | `production` | Enables strict CORS, HSTS, demo account disabling |
| `DATABASE_URL` | Production | `postgres://trio_user:***@dpg-***.oregon-postgres.render.com/trio_db` | PostgreSQL connection string |
| `REDIS_URL` | Production | `redis://default:***@red-***.oregon-redis.render.com:6379` | Redis sliding-window cache |
| `FRONTEND_URL` | Production | `https://trio-ai.vercel.app` | Base URL used in password reset links |
| `CORS_ORIGINS` | Production | `https://trio-ai.vercel.app` | Allowed origins (no localhost) |
| `ALLOWED_HOSTS`| Production | `*.onrender.com,trio-backend.onrender.com,*.vercel.app` | Trusted host validation |
| `PYTHON_VERSION`| Production | `3.11.10` | Python runtime version |
| `EMAIL_FROM` | Production | `TRIO <noreply@trio-ai.dev>` | Email sender identity |
| `RESEND_API_KEY`| Production | `re_***` | Resend API token for transactional emails |
| `VITE_API_URL` | Production | `https://trio-backend.onrender.com/api` | Frontend API target |

---

## 4. Verification of Live Health Check Endpoints

Both `/api/health` and `/health` were verified against the live ASGI pipeline:

```json
{
  "status": "healthy",
  "service": "TRIO AI Discovery Platform",
  "version": "3.0.0",
  "timestamp": 1763164800.0,
  "status_code": 200,
  "database": "PostgreSQL",
  "rate_limiter": {
    "engine": "Redis (Distributed Sliding Window via Lua)",
    "status": "connected",
    "clock_source": "Redis Server TIME (Atomic)"
  },
  "environment": "production"
}
```

