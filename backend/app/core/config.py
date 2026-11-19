"""
TRIO Core Configuration
"""

import os
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    PROJECT_NAME: str = "TRIO AI Discovery Platform"
    VERSION: str = "3.0.0"
    API_PREFIX: str = "/api"

    # Development allowed origins (only for local development)
    DEV_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]

    # Production allowed origins (strict HTTPS, no localhost, no wildcards)
    PROD_CORS_ORIGINS: List[str] = [
        "https://trio-ai.vercel.app"
    ]

    DEFAULT_ALPHA: float = 0.45
    DEFAULT_BETA: float = 0.30
    DEFAULT_GAMMA: float = 0.25
    DEFAULT_CONTRADICTION_THRESHOLD: float = 0.48
    MIN_EVIDENCE_DISCOVERY: int = 15

settings = Settings()
