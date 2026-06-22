# Industrial Knowledge Brain — Backend MVP Design

**Date:** 2026-06-22
**Status:** Approved
**Scope:** Backend only. The React/JSX (Vite) frontend lives at the repo root and is
built separately; the backend lives in `backend/` and exposes a JSON REST API.

## Objective

A centralized AI knowledge platform for industrial organizations. Admins ingest
heterogeneous documents (manuals, inspection/maintenance/incident reports, SOPs,
spreadsheets, scanned images). Users query the knowledge base in natural language
through an AI Copilot and receive source-backed answers via RAG + Gemini.

## Stack

- **API:** FastAPI (async), layered router → service → repository (repository pattern)
- **Auth + Storage + Postgres:** Supabase (hosted cloud)
- **Vector DB:** ChromaDB (Docker container)
- **LLM:** Gemini (answers, summaries, reasoning)
- **Embeddings:** Gemini embeddings primary; Sentence Transformers alternate backend
- **Document parsing:** PyMuPDF, python-docx, pandas; PaddleOCR (optional, flagged)
- **Deploy:** Docker + Docker Compose (app + chromadb; Supabase is hosted)

## Integration with the JSX frontend

- CORS enabled (configurable origins) so the Vite/React app can call the API.
- Clean JSON contracts; OpenAPI at `/docs` and `/openapi.json`.
- Shared Supabase Auth: frontend logs in via Supabase JS SDK, sends the JWT as
  `Authorization: Bearer <token>`; backend verifies the same token.

## Out of scope (clean extension points only)

- **Neo4j knowledge graph** — interfaces/docs left as extension points
- **LangGraph AI agents** (Search/Summary/Maintenance/RCA/Compliance) — future
- **Frontend** — built separately by another developer

## Architecture

```
Admin → /documents/upload → Supabase Storage + documents row (status=processing)
                                   ↓ (background task)
        detect type → extract text → clean → chunk (1000/200) → embed → ChromaDB
                                   ↓
                            status=ready

User → /query → embed question → Chroma top-10 → build context → Gemini
            → { answer, sources[], confidence_score, related_documents[] }
            → persist chat turn (sessions/messages)
```

## Folder structure (backend/)

```
backend/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── requirements.txt
├── app/
│   ├── main.py
│   ├── core/        # config, logging, exceptions, security, deps, container
│   ├── db/          # supabase client, sqlalchemy async engine, chroma client
│   ├── models/      # SQLAlchemy ORM + Pydantic schemas
│   ├── repositories/
│   ├── services/    # document_processing, chunking, embedding, vector_store,
│   │               #   ingestion, rag, summarization, llm
│   ├── api/v1/      # health, documents, query, chat routers
│   └── utils/
├── sql/schema.sql
└── tests/
```

## Roles & auth

Supabase Auth issues JWTs. Backend verifies the JWT using the Supabase JWT secret
(HS256, audience `authenticated`) and resolves role from a `profiles` table (source
of truth). Two DI guards: `require_admin`, `require_user`. A dev escape hatch
(`AUTH_ENABLED=false`) returns a synthetic admin so the API can run without Supabase.

## Database schema (Supabase Postgres)

- `profiles(id uuid pk, email text, role text)` — `admin` | `user`
- `documents(id uuid pk, file_name, file_type, storage_path, page_count int,
  status text, error text null, uploaded_by uuid, upload_date timestamptz)`
  — status: `processing` | `ready` | `failed`
- `chunks(id uuid pk, document_id uuid fk, chunk_index int, text text)`
- `chat_sessions(id uuid pk, user_id uuid, title text, created_at timestamptz)`
- `chat_messages(id uuid pk, session_id uuid fk, role text, content text,
  sources jsonb, created_at timestamptz)`

## API endpoints (v1)

- `GET  /health`
- `POST /api/v1/documents/upload` (admin) — multipart file → document_id
- `GET  /api/v1/documents` (admin) — list
- `GET  /api/v1/documents/{id}` (admin) — detail
- `GET  /api/v1/documents/{id}/status` (admin) — processing status
- `DELETE /api/v1/documents/{id}` (admin) — delete file + chunks + vectors
- `POST /api/v1/query` (user) — RAG answer with sources
- `POST /api/v1/summarize` (user) — single or multi-document summary
- `POST /api/v1/search` (user) — raw vector search (debug/retrieval)
- `GET  /api/v1/chat/sessions` (user) — list sessions
- `GET  /api/v1/chat/sessions/{id}` (user) — messages in a session

## Query response contract

```json
{
  "answer": "string",
  "sources": [{"document_id":"","file_name":"","chunk_index":0,"score":0.0}],
  "confidence_score": 0.0,
  "related_documents": ["file_name.pdf"]
}
```

## Cross-cutting

- pydantic-settings configuration from environment
- Structured logging with request context
- Central exception handlers mapping domain errors → HTTP status
- Async SQLAlchemy sessions via FastAPI dependency injection
- Embedding in-memory cache + retry with backoff
- Graceful degradation: mock LLM/embeddings when keys absent (dev mode)

## Pragmatic decisions

1. **PaddleOCR optional** — OCR behind an interface, enabled via `ENABLE_OCR`.
2. **Single embedding backend per deployment** — Gemini (768-d) and MiniLM (384-d)
   cannot share a Chroma collection. "Fallback" = retry within the provider.
3. **In-process background processing** — FastAPI BackgroundTasks for MVP.

## Testing

- Unit tests: chunking, embedding cache, text cleaning.
- Smoke test: app boots and `/health` returns ok.
