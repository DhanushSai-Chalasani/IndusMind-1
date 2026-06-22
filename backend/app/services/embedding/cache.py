"""A tiny in-memory LRU cache for embeddings, keyed by text hash."""
from __future__ import annotations

import hashlib
from collections import OrderedDict


class EmbeddingCache:
    def __init__(self, max_size: int = 4096) -> None:
        self._max_size = max_size
        self._store: OrderedDict[str, list[float]] = OrderedDict()

    @staticmethod
    def _key(text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get(self, text: str) -> list[float] | None:
        key = self._key(text)
        if key in self._store:
            self._store.move_to_end(key)
            return self._store[key]
        return None

    def set(self, text: str, embedding: list[float]) -> None:
        key = self._key(text)
        self._store[key] = embedding
        self._store.move_to_end(key)
        while len(self._store) > self._max_size:
            self._store.popitem(last=False)

    def __len__(self) -> int:
        return len(self._store)

    def clear(self) -> None:
        self._store.clear()
