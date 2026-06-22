"""Smoke test: the app boots and /health responds.

Runs with AUTH disabled and no external services; the container builds with mock
Gemini and a local Chroma client.
"""
import os

os.environ.setdefault("AUTH_ENABLED", "false")
os.environ.setdefault("AUTO_CREATE_TABLES", "false")
os.environ.setdefault("DATABASE_URL", "")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import create_app  # noqa: E402


def test_health_ok():
    app = create_app()
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"
