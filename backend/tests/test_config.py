"""Tests for CORS origin parsing (exact list vs wildcard regex)."""
import re

from app.core.config import Settings


def test_exact_origins_exclude_wildcards():
    s = Settings(cors_origins="http://localhost:5173,https://indusmind-1.vercel.app,https://*.vercel.app")
    assert s.cors_origins_list == [
        "http://localhost:5173",
        "https://indusmind-1.vercel.app",
    ]


def test_wildcard_origin_regex_matches_preview_subdomains():
    s = Settings(cors_origins="http://localhost:5173,https://*.vercel.app")
    pattern = s.cors_origin_regex
    assert pattern is not None
    rx = re.compile(pattern)
    # Vercel preview deployments get random subdomains; they must match.
    assert rx.fullmatch("https://indusmind-1-git-feature-team.vercel.app")
    assert rx.fullmatch("https://indusmind-abc123.vercel.app")
    # A different domain must NOT match.
    assert rx.fullmatch("https://evil.com") is None


def test_no_wildcard_means_no_regex():
    s = Settings(cors_origins="http://localhost:5173,http://localhost:3000")
    assert s.cors_origin_regex is None
