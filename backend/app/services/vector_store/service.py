"""ChromaDB-backed vector store: index, search, delete by document."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass

from app.core.logging import get_logger
from app.db.chroma_client import get_collection

logger = get_logger(__name__)


@dataclass(slots=True)
class VectorMatch:
    chunk_id: str
    document_id: str
    file_name: str
    chunk_index: int
    text: str
    score: float  # cosine similarity in [0, 1] (higher = closer)


class VectorStore:
    """Thin async wrapper around the Chroma collection."""

    async def index(
        self,
        *,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        if not ids:
            return
        await asyncio.to_thread(
            self._upsert, ids, documents, embeddings, metadatas
        )

    def _upsert(self, ids, documents, embeddings, metadatas) -> None:
        collection = get_collection()
        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        logger.info("Indexed %d vectors", len(ids))

    async def search(
        self,
        *,
        query_embedding: list[float],
        top_k: int,
        document_id: str | None = None,
    ) -> list[VectorMatch]:
        where = {"document_id": document_id} if document_id else None
        raw = await asyncio.to_thread(self._query, query_embedding, top_k, where)
        return self._to_matches(raw)

    def _query(self, query_embedding, top_k, where):
        collection = get_collection()
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

    @staticmethod
    def _to_matches(raw) -> list[VectorMatch]:
        ids = (raw.get("ids") or [[]])[0]
        docs = (raw.get("documents") or [[]])[0]
        metas = (raw.get("metadatas") or [[]])[0]
        dists = (raw.get("distances") or [[]])[0]

        matches: list[VectorMatch] = []
        for cid, text, meta, dist in zip(ids, docs, metas, dists):
            meta = meta or {}
            # Cosine distance -> similarity.
            score = max(0.0, 1.0 - float(dist))
            matches.append(
                VectorMatch(
                    chunk_id=cid,
                    document_id=str(meta.get("document_id", "")),
                    file_name=str(meta.get("file_name", "")),
                    chunk_index=int(meta.get("chunk_index", 0)),
                    text=text or "",
                    score=round(score, 4),
                )
            )
        return matches

    async def delete_document(self, document_id: str) -> None:
        await asyncio.to_thread(self._delete, document_id)

    def _delete(self, document_id: str) -> None:
        collection = get_collection()
        collection.delete(where={"document_id": document_id})
        logger.info("Deleted vectors for document %s", document_id)
