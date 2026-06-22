"""ID helpers."""
from __future__ import annotations

import uuid


def chunk_id(document_id: uuid.UUID | str, index: int) -> str:
    """Deterministic vector id for a document chunk."""
    return f"{document_id}:{index}"
