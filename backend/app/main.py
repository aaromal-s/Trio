"""
TRIO AI Discovery Platform - Main FastAPI Application
- Database auto-migration on startup
- Security headers middleware
- Environment-based configuration
"""

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

from app.core.config import settings
from app.core.database import run_migrations, seed_default_users, seed_bootstrap_admin
from app.core.security import SecurityHeadersMiddleware
from app.api import datasets, models, memory, discoveries, evaluation, dashboard, auth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
logger = logging.getLogger("trio.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: run migrations and seed defaults. Shutdown: cleanup."""
    logger.info("Starting TRIO AI Discovery Platform %s", settings.VERSION)
    try:
        run_migrations()
        seed_default_users(auth.hash_password)
        seed_bootstrap_admin(auth.hash_password)
        logger.info("Database initialized and seeded.")
    except Exception as e:
        logger.error("Database initialization failed: %s", e)
    yield
    logger.info("TRIO shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery",
    lifespan=lifespan,
)

from starlette.middleware.trustedhost import TrustedHostMiddleware

# Security headers (before CORS so they're always applied)
app.add_middleware(SecurityHeadersMiddleware)

# Environment check
is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"

# Trusted host validation
if is_production:
    raw_hosts = os.environ.get("ALLOWED_HOSTS", "")
    if raw_hosts:
        allowed_hosts = [h.strip() for h in raw_hosts.split(",") if h.strip()]
        if "testserver" not in allowed_hosts:
            allowed_hosts.append("testserver")
    else:
        allowed_hosts = [
            "*.onrender.com",
            "trio-backend.onrender.com",
            "*.vercel.app",
            "testserver"
        ]
else:
    allowed_hosts = ["*"]

app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# CORS configuration: strict separation of production and development
is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"

if is_production:
    raw_origins = os.environ.get("CORS_ORIGINS", "")
    if raw_origins:
        # Strictly exclude any localhost or wildcard in production
        allowed_origins = [
            o.strip() for o in raw_origins.split(",")
            if o.strip() and not any(dev_pattern in o.lower() for dev_pattern in ("localhost", "127.0.0.1", "0.0.0.0", "*"))
        ]
        if not allowed_origins:
            allowed_origins = settings.PROD_CORS_ORIGINS
    else:
        allowed_origins = settings.PROD_CORS_ORIGINS
    allow_origin_regex = r"^https://.*\.vercel\.app$"
else:
    allowed_origins = settings.DEV_CORS_ORIGINS
    allow_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Retry-After"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(datasets.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)
app.include_router(memory.router, prefix=settings.API_PREFIX)
app.include_router(discoveries.router, prefix=settings.API_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
@app.get("/health")
def health_check():
    from app.core.rate_limiter import get_rate_limiter_info
    from app.core.database import _get_database_url, _is_postgres
    db_url = _get_database_url()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": time.time(),
        "status_code": 200,
        "database": "PostgreSQL" if _is_postgres(db_url) else "SQLite",
        "rate_limiter": get_rate_limiter_info(),
        "environment": os.environ.get("ENVIRONMENT", "development"),
    }

@app.get("/")
def root():
    return {
        "message": "TRIO AI Discovery Platform API is active.",
        "docs_url": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
