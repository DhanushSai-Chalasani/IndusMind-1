"""Gemini text-generation client.

When no API key is configured the client runs in a deterministic "mock" mode so
the rest of the system (RAG, summarization) remains exercisable in local dev and
tests without network access.
"""
from __future__ import annotations

import asyncio

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import LLMError
from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiClient:
    def __init__(self) -> None:
        self._enabled = settings.has_gemini
        self._model = None
        if self._enabled:
            import google.generativeai as genai

            genai.configure(api_key=settings.gemini_api_key)
            self._model = genai.GenerativeModel(settings.gemini_model)
            logger.info("GeminiClient initialised with model '%s'", settings.gemini_model)
        else:
            logger.warning("GEMINI_API_KEY not set; GeminiClient running in mock mode")

    @property
    def enabled(self) -> bool:
        return self._enabled

    async def generate(self, prompt: str, *, system: str | None = None) -> str:
        """Generate text for the given prompt. Returns a string answer."""
        if not self._enabled:
            return self._mock(prompt)
        try:
            return await self._generate_with_retry(prompt, system)
        except Exception as exc:  # noqa: BLE001
            raise LLMError(f"Gemini generation failed: {exc}") from exc

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
    )
    async def _generate_with_retry(self, prompt: str, system: str | None) -> str:
        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        response = await asyncio.to_thread(self._model.generate_content, full_prompt)
        text = getattr(response, "text", None)
        if not text:
            raise LLMError("Gemini returned an empty response")
        return text.strip()

    @staticmethod
    def _mock(prompt: str) -> str:
        snippet = prompt.strip().replace("\n", " ")[:240]
        return (
            "[MOCK ANSWER — set GEMINI_API_KEY for real generation]\n"
            f"Based on the retrieved context, here is a summary of the relevant "
            f"information: {snippet}"
        )
