"""Aggregate v1 router."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import chat, documents, query

api_router = APIRouter()
api_router.include_router(documents.router)
api_router.include_router(query.router)
api_router.include_router(chat.router)
