"""Unit tests for text cleaning."""
from app.services.document_processing.cleaner import clean_text


def test_collapses_whitespace():
    assert clean_text("Pump    P101\t\tfailed") == "Pump P101 failed"


def test_normalises_newlines_and_trims():
    assert clean_text("a\r\n\r\n\r\n\r\nb") == "a\n\nb"


def test_empty():
    assert clean_text("") == ""
