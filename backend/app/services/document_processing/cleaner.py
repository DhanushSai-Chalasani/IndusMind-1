"""Text cleaning utilities."""
from __future__ import annotations

import re

_MULTI_NEWLINE = re.compile(r"\n{3,}")
_TRAILING_WS = re.compile(r"[ \t]+(\n)")
_MULTI_SPACE = re.compile(r"[ \t]{2,}")


def clean_text(text: str) -> str:
    """Normalise whitespace and strip control characters from extracted text."""
    if not text:
        return ""
    # Drop non-printable control chars except newline and tab.
    text = "".join(ch for ch in text if ch == "\n" or ch == "\t" or ch.isprintable())
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = _TRAILING_WS.sub(r"\1", text)
    text = _MULTI_SPACE.sub(" ", text)
    text = _MULTI_NEWLINE.sub("\n\n", text)
    return text.strip()
