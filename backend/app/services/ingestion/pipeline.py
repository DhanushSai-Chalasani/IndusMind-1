"""Background ingestion pipeline.

Runs after upload: extract -> chunk -> persist chunks -> embed -> index in Chroma,
updating the document's status throughout. Owns its own DB session because it runs
outside the request lifecycle (FastAPI BackgroundTasks).
"""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.logging import get_logger
from app.repositories.document_repo import DocumentRepository
from app.services.chunking.service import ChunkingService
from app.services.document_processing.service import DocumentProcessor
from app.services.embedding.service import EmbeddingService
from app.services.vector_store.service import VectorStore
from app.utils.ids import chunk_id

logger = get_logger(__name__)


class IngestionPipeline:
    def __init__(
        self,
        *,
        sessionmaker: async_sessionmaker | None,
        processor: DocumentProcessor,
        chunker: ChunkingService,
        embedder: EmbeddingService,
        vector_store: VectorStore,
    ) -> None:
        self._sessionmaker = sessionmaker
        self._processor = processor
        self._chunker = chunker
        self._embedder = embedder
        self._store = vector_store

    async def run(
        self, *, document_id: uuid.UUID, file_name: str, data: bytes
    ) -> None:
        """Process and index a single document. Marks status failed on error."""
        logger.info("Ingestion started for %s (%s)", document_id, file_name)
        try:
            processed = await self._processor.process(file_name=file_name, data=data)
            chunks = self._chunker.split(processed.text)

            if not chunks:
                await self._finish(document_id, "failed", error="No text extracted")
                return

            await self._persist_and_index(document_id, file_name, chunks, processed.page_count)
            await self._finish(document_id, "ready", page_count=processed.page_count)
            logger.info("Ingestion complete for %s (%d chunks)", document_id, len(chunks))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Ingestion failed for %s", document_id)
            await self._finish(document_id, "failed", error=str(exc)[:500])

    async def _persist_and_index(
        self,
        document_id: uuid.UUID,
        file_name: str,
        chunks: list[str],
        page_count: int,
    ) -> None:
        async with self._sessionmaker() as session:
            repo = DocumentRepository(session)
            await repo.add_chunks(document_id, chunks)
            await session.commit()

        embeddings = await self._embedder.generate_batch_embeddings(chunks)

        ids = [chunk_id(document_id, i) for i in range(len(chunks))]
        metadatas = [
            {
                "document_id": str(document_id),
                "file_name": file_name,
                "chunk_index": i,
            }
            for i in range(len(chunks))
        ]
        await self._store.index(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    async def _finish(
        self,
        document_id: uuid.UUID,
        status: str,
        *,
        error: str | None = None,
        page_count: int | None = None,
    ) -> None:
        async with self._sessionmaker() as session:
            repo = DocumentRepository(session)
            await repo.set_status(
                document_id, status, error=error, page_count=page_count
            )
            await session.commit()
