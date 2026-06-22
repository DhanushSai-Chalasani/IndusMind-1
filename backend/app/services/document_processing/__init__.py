"""Document processing: type detection, text extraction, OCR, cleaning."""
from app.services.document_processing.service import (
    DocumentProcessor,
    ProcessedDocument,
)

__all__ = ["DocumentProcessor", "ProcessedDocument"]
