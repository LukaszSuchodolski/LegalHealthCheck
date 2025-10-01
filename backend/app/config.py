from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List

class Settings(BaseSettings):
    app_name: str = "LegalHealthCheck"
    app_env: str = "dev"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, v):
        # pozwala użyć CSV w .env (bez nawiasów) lub listy JSON (z nawiasami)
        if isinstance(v, str) and v and v[0] != "[":
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        env_file = ".env"

settings = Settings()
