"""ChromaDB client and collection accessor.

Tries an HTTP client first (the docker-compose chromadb service). If that is
unreachable, falls back to a local persistent client so the backend still runs
on a laptop without the container.
"""
from __future__ import annotations

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_client = None
_collection = None


def _build_client():
    import chromadb

    try:
        client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
        client.heartbeat()
        logger.info(
            "Connected to ChromaDB at %s:%s", settings.chroma_host, settings.chroma_port
        )
        return client
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "ChromaDB HTTP client unavailable (%s); using local persistent client", exc
        )
        return chromadb.PersistentClient(path="./chroma_data")


def get_collection():
    """Return the shared industrial_documents collection (cosine space)."""
    global _client, _collection
    if _collection is None:
        _client = _build_client()
        _collection = _client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def reset_collection_cache() -> None:
    """Drop cached client/collection (used in tests)."""
    global _client, _collection
    _client = None
    _collection = None
