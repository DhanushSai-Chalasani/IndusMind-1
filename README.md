# IndusMind — AI-Powered Industrial Knowledge Intelligence Platform

IndusMind is an AI copilot for industrial operations teams. Upload your SOPs, maintenance logs, inspection reports, and incident records — then ask natural language questions and get answers with source citations, confidence scores, and compliance gap detection.

Built for the **ET India National Level Hackathon 2026**.

---

## What It Does

- **Knowledge Copilot** — Chat with your organization's documents. Ask anything, get cited answers.
- **Compliance Scan** — Surface overdue inspections and safety deviations from uploaded reports.
- **Root Cause Analysis** — Identify probable failure causes from maintenance and incident records.
- **Admin Dashboard** — Upload and manage documents, monitor ingestion status, query the knowledge base.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | FastAPI (Python) — runs as a Vercel serverless function |
| Auth | Supabase Auth (JWT) |
| Database | Supabase Postgres + pgvector (vector similarity search) |
| Storage | Supabase Storage (raw document files) |
| AI | Google Gemini 1.5 Flash (answers) + text-embedding-004 (embeddings) |
| Deployment | Vercel (full-stack — frontend + Python serverless in one project) |

---

## Architecture

```
Browser ──► Vercel static (dist/)         ← React/Vite UI
        └─► /api/* ──► Vercel Python fn   ← FastAPI (api/index.py → backend/app)
                          │
                          ├─► Supabase Postgres + pgvector (chunks, vectors)
                          ├─► Supabase Storage (raw files)
                          └─► Gemini API (embeddings + answers)
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project (see `DEPLOY_VERCEL.md`)

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload --port 8000
```

### Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# Leave VITE_API_URL unset for Vercel; set to http://localhost:8000 for local dev
```

---

## Deployment

Full deployment guide: [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md)

The short version:
1. Create a Supabase project and run `backend/sql/schema.sql`
2. Import this repo into Vercel
3. Set the required environment variables in the Vercel dashboard
4. Redeploy — frontend + backend go live in one step

---

## Team

Built with ❤️ for ET India Hackathon 2026.
