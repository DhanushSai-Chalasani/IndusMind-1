"""Seed the knowledge base with sample industrial documents, then run demo queries.

Usage (with the backend running):

    # easiest: run the API with AUTH_ENABLED=false, then:
    python scripts/seed.py

    # against an auth-enabled API, pass an admin JWT:
    SEED_TOKEN=<supabase-access-token> python scripts/seed.py

Environment:
    API_URL     Backend base URL (default http://localhost:8000)
    SEED_TOKEN  Optional Bearer token (admin) for auth-enabled deployments
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import httpx

API_URL = os.getenv("API_URL", "http://localhost:8000").rstrip("/")
TOKEN = os.getenv("SEED_TOKEN", "")
SAMPLE_DIR = Path(__file__).resolve().parent.parent / "sample_data"

DEMO_QUERIES = [
    "Why did Pump P101 fail?",
    "What inspections or actions are overdue for Boiler B201?",
    "Summarize the incidents related to Compressor C101.",
    "What is the safe shutdown procedure for Boiler B201 during a gas pressure abnormality?",
    "What recurring failures are occurring in Unit A?",
]

CONTENT_TYPES = {
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _headers() -> dict:
    return {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}


def _check_api(client: httpx.Client) -> None:
    try:
        resp = client.get(f"{API_URL}/health", timeout=10)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        sys.exit(f"ERROR: cannot reach API at {API_URL} ({exc}). Is the backend running?")
    print(f"✓ API reachable at {API_URL}")


def upload_all(client: httpx.Client) -> list[str]:
    if not SAMPLE_DIR.exists():
        sys.exit(f"ERROR: sample_data directory not found at {SAMPLE_DIR}")

    files = sorted(p for p in SAMPLE_DIR.iterdir() if p.suffix.lower() in CONTENT_TYPES)
    if not files:
        sys.exit(f"ERROR: no sample files found in {SAMPLE_DIR}")

    doc_ids: list[str] = []
    for path in files:
        ctype = CONTENT_TYPES[path.suffix.lower()]
        with path.open("rb") as fh:
            resp = client.post(
                f"{API_URL}/api/v1/documents/upload",
                headers=_headers(),
                files={"file": (path.name, fh, ctype)},
                timeout=60,
            )
        if resp.status_code == 403:
            sys.exit("ERROR: 403 Forbidden. Provide an admin SEED_TOKEN or run the "
                     "API with AUTH_ENABLED=false.")
        resp.raise_for_status()
        data = resp.json()
        doc_ids.append(data["document_id"])
        print(f"  ↑ uploaded {path.name}  →  {data['document_id']}")
    return doc_ids


def wait_until_ready(client: httpx.Client, doc_ids: list[str], timeout: float = 180) -> None:
    print("\nWaiting for ingestion to complete…")
    deadline = time.time() + timeout
    pending = set(doc_ids)
    while pending and time.time() < deadline:
        for doc_id in list(pending):
            resp = client.get(
                f"{API_URL}/api/v1/documents/{doc_id}/status", headers=_headers(), timeout=15
            )
            resp.raise_for_status()
            status = resp.json()["status"]
            if status == "ready":
                pending.discard(doc_id)
                print(f"  ✓ {doc_id} ready")
            elif status == "failed":
                pending.discard(doc_id)
                print(f"  ✗ {doc_id} failed: {resp.json().get('error')}")
        if pending:
            time.sleep(2)
    if pending:
        print(f"  ! {len(pending)} document(s) still processing after {timeout}s")


def run_queries(client: httpx.Client) -> None:
    print("\n" + "=" * 70)
    print("DEMO QUERIES")
    print("=" * 70)
    for question in DEMO_QUERIES:
        print(f"\nQ: {question}")
        resp = client.post(
            f"{API_URL}/api/v1/query",
            headers=_headers(),
            json={"question": question},
            timeout=120,
        )
        if resp.status_code != 200:
            print(f"   (query failed: {resp.status_code} {resp.text[:200]})")
            continue
        data = resp.json()
        answer = data.get("answer", "").strip()
        print(f"A: {answer}")
        sources = data.get("related_documents") or [
            s.get("file_name") for s in data.get("sources", [])
        ]
        uniq = list(dict.fromkeys(s for s in sources if s))
        if uniq:
            print(f"   Sources: {', '.join(uniq)}")
        print(f"   Confidence: {round(data.get('confidence_score', 0) * 100)}%")


def main() -> None:
    with httpx.Client() as client:
        _check_api(client)
        print("\nUploading sample industrial documents…")
        doc_ids = upload_all(client)
        wait_until_ready(client, doc_ids)
        run_queries(client)
    print("\n✓ Seed complete.")


if __name__ == "__main__":
    main()
