"""Health and readiness endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.deps import get_container
from app.core.container import ServiceContainer

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}


@router.get("/health/details")
async def health_details(
    container: ServiceContainer = Depends(get_container),
) -> dict:
    """Reports which optional integrations are active."""
    return {
        "status": "ok",
        "auth_enabled": settings.auth_enabled,
        "gemini": container.gemini.enabled,
        "embedding_provider": container.embedder.provider,
        "supabase_storage": settings.has_supabase,
        "database_configured": settings.has_database,
        "ocr_enabled": settings.enable_ocr,
    }
