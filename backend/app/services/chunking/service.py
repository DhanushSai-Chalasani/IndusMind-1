"""Character-window chunking with overlap.

Splits on a fixed character window (default 1000) with overlap (default 200),
preferring to break on paragraph/sentence boundaries near the window edge so
chunks stay readable.
"""
from __future__ import annotations

from app.core.config import settings

_BREAK_CHARS = ("\n\n", "\n", ". ", " ")


def chunk_text(
    text: str,
    *,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[str]:
    """Return a list of overlapping text chunks."""
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")

    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        if end < n:
            end = _best_break(text, start, end)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= n:
            break
        start = max(end - overlap, start + 1)

    return chunks


def _best_break(text: str, start: int, end: int) -> int:
    """Find a natural break point near `end`, searching back up to 20% of window."""
    window = end - start
    floor = start + int(window * 0.8)
    for sep in _BREAK_CHARS:
        idx = text.rfind(sep, floor, end)
        if idx != -1:
            return idx + len(sep)
    return end


class ChunkingService:
    """Thin object wrapper for DI/testing parity with other services."""

    def split(self, text: str) -> list[str]:
        return chunk_text(text)
