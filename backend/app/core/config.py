"""Application configuration loaded from environment via pydantic-settings."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed settings. Values come from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- App ----
    app_name: str = "Industrial Knowledge Brain"
    environment: str = "development"
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000,http://localhost:5173,https://indusmind-1.vercel.app,https://*.vercel.app"

    # ---- Auth ----
    auth_enabled: bool = True

    # ---- Supabase ----
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_bucket: str = "documents"

    # ---- Database ----
    database_url: str = ""

    # ---- Gemini ----
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_embedding_model: str = "models/text-embedding-004"

    # ---- Embeddings ----
    embedding_provider: str = "gemini"  # "gemini" | "sentence_transformers"
    sentence_transformer_model: str = "all-MiniLM-L6-v2"

    # ---- ChromaDB ----
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "industrial_documents"

    # ---- Chunking / retrieval ----
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_top_k: int = 10

    # ---- OCR ----
    enable_ocr: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS origins string into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def has_database(self) -> bool:
        return bool(self.database_url)


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor (single instance per process)."""
    return Settings()


settings = get_settings()
