"""
TRIO Core Configuration
"""

from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    PROJECT_NAME: str = "TRIO AI Discovery Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DEFAULT_ALPHA: float = 0.45
    DEFAULT_BETA: float = 0.30
    DEFAULT_GAMMA: float = 0.25
    DEFAULT_CONTRADICTION_THRESHOLD: float = 0.48
    MIN_EVIDENCE_DISCOVERY: int = 15

settings = Settings()

