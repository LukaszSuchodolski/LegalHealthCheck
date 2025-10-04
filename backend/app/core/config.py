# app/config.py  (Pydantic v2 / pydantic-settings v2)

from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # --- Twoje dotychczasowe pola ---
    app_name: str = "LegalHealthCheck"
    app_env: str = "dev"

    # --- DODANE pola potrzebne do JWT ---
    secret_key: str                     # mapuje się na SECRET_KEY z .env
    algorithm: str = "HS256"            # ALGORITHM w .env (opcjonalnie)
    access_token_expire_minutes: int = 60  # ACCESS_TOKEN_EXPIRE_MINUTES

    # CORS – zostaw jak masz lub użyj domyślnych
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Pozwala użyć CSV lub JSON-listy w .env
    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, v):
        if isinstance(v, str) and v and not v.strip().startswith("["):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    # Konfiguracja Pydantic v2
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # ignoruj ewentualne inne klucze w .env
    )

settings = Settings()
