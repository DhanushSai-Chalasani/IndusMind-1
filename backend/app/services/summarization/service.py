"""Single- and multi-document summarization built on stored chunks + Gemini."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.schemas import SummarizeResponse
from app.repositories.document_repo import DocumentRepository
from app.services.llm.gemini_client import GeminiClient
from app.services.rag.prompts import (
    SUMMARY_SYSTEM,
    build_multi_summary_prompt,
    build_single_summary_prompt,
)

# Cap content fed to the model to keep prompts within limits.
_MAX_CHARS = 24_000


class SummarizationService:
    def __init__(self, gemini: GeminiClient) -> None:
        self._gemini = gemini

    async def summarize(
        self,
        session: AsyncSession,
        *,
        document_ids: list[uuid.UUID],
        focus: str | None = None,
    ) -> SummarizeResponse:
        repo = DocumentRepository(session)
        collected: list[tuple[str, str]] = []  # (file_name, content)

        for doc_id in document_ids:
            doc = await repo.get(doc_id)
            if doc is None:
                raise NotFoundError(f"Document {doc_id} not found")
            chunks = await repo.get_chunks(doc_id)
            content = "\n".join(c.text for c in chunks)
            collected.append((doc.file_name, content))

        related = [name for name, _ in collected]

        if len(collected) == 1:
            file_name, content = collected[0]
            prompt = build_single_summary_prompt(
                file_name, content[:_MAX_CHARS], focus
            )
        else:
            budget = _MAX_CHARS // max(1, len(collected))
            merged = "\n\n".join(
                f"## {name}\n{content[:budget]}" for name, content in collected
            )
            prompt = build_multi_summary_prompt(merged, focus)

        summary = await self._gemini.generate(prompt, system=SUMMARY_SYSTEM)

        return SummarizeResponse(
            summary=summary,
            document_ids=document_ids,
            related_documents=related,
        )
