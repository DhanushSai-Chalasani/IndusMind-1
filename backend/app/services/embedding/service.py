"""Embedding generation with caching and retry.

One provider is active per deployment (config EMBEDDING_PROVIDER). Gemini (768-d)
and Sentence Transformers (e.g. MiniLM, 384-d) produce different dimensions and
therefore cannot share a Chroma collection — switching providers requires a
re-index. "Retry" happens within the active provider, not across providers.
"""
from __future__ import annotations

import asyncio

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import EmbeddingError
from app.core.logging import get_logger
from app.services.embedding.cache import EmbeddingCache

logger = get_logger(__name__)


class EmbeddingService:
    """Generates embeddings for single texts or batches, with an LRU cache."""

    def __init__(self) -> None:
        self._provider = settings.embedding_provider.lower()
        self._cache = EmbeddingCache()
        self._st_model = None  # lazy SentenceTransformer
        self._gemini_ready = False

        if self._provider == "gemini" and not settings.has_gemini:
            logger.warning(
                "EMBEDDING_PROVIDER=gemini but GEMINI_API_KEY is missing; "
                "falling back to sentence_transformers"
            )
            self._provider = "sentence_transformers"

        logger.info("EmbeddingService provider: %s", self._provider)

    @property
    def provider(self) -> str:
        return self._provider

    async def generate_embedding(self, text: str) -> list[float]:
        cached = self._cache.get(text)
        if cached is not None:
            return cached
        vector = (await self._embed_batch([text]))[0]
        self._cache.set(text, vector)
        return vector

    async def generate_batch_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        results: list[list[float] | None] = [self._cache.get(t) for t in texts]
        missing_idx = [i for i, v in enumerate(results) if v is None]
        if missing_idx:
            to_embed = [texts[i] for i in missing_idx]
            vectors = await self._embed_batch(to_embed)
            for i, vec in zip(missing_idx, vectors):
                results[i] = vec
                self._cache.set(texts[i], vec)
        return [v for v in results if v is not None]

    # ------------------------------------------------------------------ #
    # Providers
    # ------------------------------------------------------------------ #

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
    )
    async def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        try:
            if self._provider == "gemini":
                return await self._embed_gemini(texts)
            return await self._embed_sentence_transformers(texts)
        except Exception as exc:  # noqa: BLE001
            raise EmbeddingError(f"Embedding failed: {exc}") from exc

    async def _embed_gemini(self, texts: list[str]) -> list[list[float]]:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)

        def _run() -> list[list[float]]:
            out: list[list[float]] = []
            for text in texts:
                resp = genai.embed_content(
                    model=settings.gemini_embedding_model,
                    content=text,
                    task_type="retrieval_document",
                )
                out.append(resp["embedding"])
            return out

        return await asyncio.to_thread(_run)

    async def _embed_sentence_transformers(self, texts: list[str]) -> list[list[float]]:
        model = self._load_st_model()

        def _run() -> list[list[float]]:
            vectors = model.encode(texts, normalize_embeddings=True)
            return [v.tolist() for v in vectors]

        return await asyncio.to_thread(_run)

    def _load_st_model(self):
        if self._st_model is None:
            from sentence_transformers import SentenceTransformer

            logger.info(
                "Loading SentenceTransformer '%s'", settings.sentence_transformer_model
            )
            self._st_model = SentenceTransformer(settings.sentence_transformer_model)
        return self._st_model
