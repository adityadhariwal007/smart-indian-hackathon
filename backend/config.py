import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    # Infermedica API credentials
    INFERMEDICA_CLIENT_ID: Optional[str] = None
    INFERMEDICA_CLIENT_SECRET: Optional[str] = None
    INFERMEDICA_INSTANCE_ID: Optional[str] = None
    INFERMEDICA_SCOPE: str = "conversational_triage:write"
    INFERMEDICA_OAUTH_URL: str = "https://auth.infermedica.com/oauth/token"
    INFERMEDICA_API_BASE: str = "https://api.infermedica.com/v3"
    
    # Database
    DATABASE_URL: str = "sqlite:///./healthflow_ai.db"
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
