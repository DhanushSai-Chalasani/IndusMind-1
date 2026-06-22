"""FastAPI application entrypoint."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.container import build_container
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger

logger = get_logger(__name__)


async def _maybe_create_tables() -> None:
    """In development, create our tables if they don't exist (best-effort)."""
    if not settings.has_database:
        logger.warning("DATABASE_URL not set; skipping table creation")
        return
    if os.getenv("AUTO_CREATE_TABLES", "true").lower() != "true":
        return
    try:
        from app.db.session import get_engine
        from app.models.orm import Base

        engine = get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not ensure tables (continuing): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Starting %s", settings.app_name)
    await _maybe_create_tables()
    app.state.container = build_container()
    logger.info("Service container ready")
    try:
        yield
    finally:
        from app.db.session import dispose_engine

        await dispose_engine()
        logger.info("Shutdown complete")


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="AI-powered Industrial Knowledge Intelligence Platform — backend API.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
