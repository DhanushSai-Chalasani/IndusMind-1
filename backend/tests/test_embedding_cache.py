"""Unit tests for the embedding LRU cache."""
from app.services.embedding.cache import EmbeddingCache


def test_set_and_get():
    cache = EmbeddingCache(max_size=10)
    cache.set("pump", [0.1, 0.2, 0.3])
    assert cache.get("pump") == [0.1, 0.2, 0.3]


def test_miss_returns_none():
    cache = EmbeddingCache()
    assert cache.get("unknown") is None


def test_lru_eviction():
    cache = EmbeddingCache(max_size=2)
    cache.set("a", [1.0])
    cache.set("b", [2.0])
    cache.get("a")  # touch a so b is least-recently-used
    cache.set("c", [3.0])  # evicts b
    assert cache.get("b") is None
    assert cache.get("a") == [1.0]
    assert cache.get("c") == [3.0]
