"""Unit tests for embedding provider helpers (no network)."""
from app.services.embedding.service import EmbeddingService


def test_normalize_hf_pooled_vector_passthrough():
    # Sentence-transformers models return a pooled 1-D vector.
    vec = [0.1, 0.2, 0.3]
    assert EmbeddingService._normalize_hf(vec) == [0.1, 0.2, 0.3]


def test_normalize_hf_token_level_mean_pooled():
    # Plain encoders return token-level [tokens][dim]; we mean-pool over tokens.
    tokens = [[0.0, 2.0], [2.0, 4.0]]  # mean -> [1.0, 3.0]
    assert EmbeddingService._normalize_hf(tokens) == [1.0, 3.0]


def test_normalize_hf_empty():
    assert EmbeddingService._normalize_hf([]) == []
