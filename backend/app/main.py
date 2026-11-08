"""
TRIO AI Discovery Platform - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

from app.core.config import settings
from app.api import datasets, models, memory, discoveries, evaluation, dashboard

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(datasets.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)
app.include_router(memory.router, prefix=settings.API_PREFIX)
app.include_router(discoveries.router, prefix=settings.API_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": time.time(),
        "status_code": 200
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

