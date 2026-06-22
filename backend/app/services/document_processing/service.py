"""Document processing orchestration: bytes in, clean text + metadata out."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass

from app.services.document_processing.cleaner import clean_text
from app.services.document_processing.extractor import detect_file_type, extract
from app.services.document_processing.ocr import OCREngine, get_ocr_engine


@dataclass(slots=True)
class ProcessedDocument:
    file_type: str
    text: str
    page_count: int


class DocumentProcessor:
    """Detects type, extracts text (with OCR for images), and cleans it."""

    def __init__(self, ocr: OCREngine | None = None) -> None:
        self._ocr = ocr or get_ocr_engine()

    async def process(self, *, file_name: str, data: bytes) -> ProcessedDocument:
        file_type = detect_file_type(file_name)
        # Extraction is CPU/IO bound and uses sync libraries -> offload to a thread.
        raw_text, page_count = await asyncio.to_thread(
            extract, data, file_type, self._ocr
        )
        return ProcessedDocument(
            file_type=file_type,
            text=clean_text(raw_text),
            page_count=page_count,
        )
