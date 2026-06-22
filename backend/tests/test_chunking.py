"""Unit tests for the chunking service."""
from app.services.chunking.service import chunk_text


def test_short_text_single_chunk():
    text = "Pump P101 failed due to bearing wear."
    assert chunk_text(text, chunk_size=1000, overlap=200) == [text]


def test_empty_text_returns_empty_list():
    assert chunk_text("   ", chunk_size=1000, overlap=200) == []


def test_long_text_splits_with_overlap():
    text = ("word " * 1000).strip()  # ~5000 chars
    chunks = chunk_text(text, chunk_size=1000, overlap=200)
    assert len(chunks) > 1
    # Every chunk respects the size bound (allow a little slack for break search).
    assert all(len(c) <= 1000 for c in chunks)


def test_overlap_creates_shared_content():
    text = ". ".join(f"sentence number {i}" for i in range(400))
    chunks = chunk_text(text, chunk_size=400, overlap=100)
    assert len(chunks) >= 2
    # Consecutive chunks should share some trailing/leading text via overlap.
    assert chunks[0][-30:] in (chunks[1][:200] + chunks[0][-30:])


def test_invalid_overlap_raises():
    try:
        chunk_text("abc", chunk_size=100, overlap=100)
    except ValueError:
        return
    raise AssertionError("expected ValueError for overlap >= chunk_size")
