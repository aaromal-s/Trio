from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1 import (
    auth, telemetry, predictions, incidents, copilot, infrastructure, analytics, health
)
from app.services.incident_service import seed_default_incidents
from app.models.user import User
from app.core.security import get_password_hash

# Create DB tables
Base.metadata.create_all(bind=engine)

# Seed initial admin user if not present
def seed_admin_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "lead@aegisops.ai").first()
        if not user:
            demo_user = User(
                email="lead@aegisops.ai",
                hashed_password=get_password_hash("AegisOps@2026"),
                full_name="Alexander Vance",
                role="admin",
                department="Site Reliability Engineering"
            )
            db.add(demo_user)
            db.commit()
        seed_default_incidents(db)
    finally:
        db.close()

seed_admin_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AegisOps AI — Elite Enterprise AIOps Platform API",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(telemetry.router, prefix=f"{settings.API_V1_STR}/telemetry", tags=["Telemetry & Observability"])
app.include_router(predictions.router, prefix=f"{settings.API_V1_STR}/predictions", tags=["ML Risk Predictions"])
app.include_router(incidents.router, prefix=f"{settings.API_V1_STR}/incidents", tags=["Incident Management"])
app.include_router(copilot.router, prefix=f"{settings.API_V1_STR}/copilot", tags=["AI Investigation Copilot"])
app.include_router(infrastructure.router, prefix=f"{settings.API_V1_STR}/infrastructure", tags=["Service Topology"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics & Reporting"])
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/system", tags=["System Health"])

@app.get("/")
def root_endpoint():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": f"{settings.API_V1_STR}/docs"
    }
