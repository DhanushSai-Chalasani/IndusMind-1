# Industrial Knowledge Brain — Backend

AI-powered Industrial Knowledge Intelligence Platform. Admins ingest documents
(manuals, inspection/maintenance/incident reports, SOPs, spreadsheets, scanned
images); users query the knowledge base in natural language and get source-backed
answers via RAG + Gemini.

> Backend only. The React/JSX (Vite) frontend lives at the repo root and talks to
> this API over JSON REST. OpenAPI docs are served at `/docs`.

## Architecture

```
Admin → POST /documents/upload → Supabase Storage + documents row (processing)
                                       ↓ background task
        extract → clean → chunk (1000/200) → embed → ChromaDB → status=ready

User → POST /query → embed → Chroma top-k → context → Gemini
                 → { answer, sources[], confidence_score, related_documents[] }
```

- **API:** FastAPI (async), repository pattern (router → service → repository)
- **Auth + Storage + Postgres:** Supabase (hosted)
- **Vector DB:** ChromaDB
- **LLM + embeddings:** Gemini (Sentence Transformers as an alternate backend)

## Layout

```
app/
  core/        config, logging, exceptions, security, deps, container
  db/          sqlalchemy engine, supabase storage, chroma client
  models/      ORM tables + Pydantic schemas
  repositories/
  services/    document_processing, chunking, embedding, vector_store,
               ingestion, rag, summarization, llm
  api/v1/      health, documents, query, chat
sql/schema.sql
tests/
```

## Quick start (Docker)

```bash
cd backend
cp .env.example .env        # fill in Supabase + Gemini values
docker compose up --build
```

- API:    http://localhost:8000  (docs at `/docs`)
- Chroma: http://localhost:8001

## Quick start (local Python)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

To run with **no external services** (mock LLM, local Chroma, no auth):

```bash
AUTH_ENABLED=false uvicorn app.main:app --reload
```

## Supabase setup

1. Create a project; copy URL, anon key, service-role key, and JWT secret into `.env`.
2. Set `DATABASE_URL` to the connection string with the async driver:
   `postgresql+asyncpg://postgres:PASSWORD@db.<project>.supabase.co:5432/postgres`
3. Run `sql/schema.sql` in the SQL editor (creates tables + a profile trigger).
4. Create a Storage bucket named `documents` (or change `SUPABASE_BUCKET`).
5. Create a user, then promote to admin:
   `update public.profiles set role='admin' where email='you@example.com';`

## Auth (frontend handshake)

The frontend logs in with the Supabase JS SDK and sends the JWT as
`Authorization: Bearer <token>`. The backend verifies the same token (HS256) and
resolves the role from `profiles`. `require_admin` guards write endpoints;
`require_user` guards copilot endpoints.

## Key endpoints

| Method | Path                              | Role  |
|--------|-----------------------------------|-------|
| GET    | `/health`                         | open  |
| POST   | `/api/v1/documents/upload`        | admin |
| GET    | `/api/v1/documents`               | admin |
| GET    | `/api/v1/documents/{id}`          | admin |
| GET    | `/api/v1/documents/{id}/status`   | admin |
| DELETE | `/api/v1/documents/{id}`          | admin |
| POST   | `/api/v1/query`                   | user  |
| POST   | `/api/v1/search`                  | user  |
| POST   | `/api/v1/summarize`               | user  |
| GET    | `/api/v1/chat/sessions`           | user  |
| GET    | `/api/v1/chat/sessions/{id}`      | user  |

## Tests

```bash
cd backend
pip install -r requirements.txt
pytest
```

## Configuration

See `.env.example`. Notable flags:

- `EMBEDDING_PROVIDER` — `gemini` (768-d) or `sentence_transformers` (384-d). One
  provider per Chroma collection; switching requires a re-index.
- `ENABLE_OCR` — off by default (PaddleOCR is heavy). Enable + install paddleocr
  to process images/scanned documents.
- `AUTH_ENABLED=false` — local dev escape hatch (returns a synthetic admin).

## Extension points (not in this MVP)

- **Neo4j knowledge graph** — entity/relationship layer over equipment & failures.
- **LangGraph agents** — Search / Summary / Maintenance / RCA / Compliance.
