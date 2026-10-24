import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisOps AI"
    VERSION: str = "1.4.2"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aegisops_enterprise_production_secret_key_change_in_prod_9876543210")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Defaults to SQLite for local dev, PostgreSQL for production)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./aegisops.db"
    )
    
    # CORS Origins (Configurable via CORS_ORIGINS env var for Vercel/AWS deployments)
    BACKEND_CORS_ORIGINS: Union[List[str], str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
    )
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]
    
    # ML settings
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "artifacts")
    MODEL_FILE: str = os.path.join(MODEL_DIR, "incident_predictor.joblib")
    METRICS_FILE: str = os.path.join(MODEL_DIR, "evaluation_metrics.json")
    
    # Auto-refresh and monitoring
    TELEMETRY_REFRESH_INTERVAL_SECONDS: int = 5
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
