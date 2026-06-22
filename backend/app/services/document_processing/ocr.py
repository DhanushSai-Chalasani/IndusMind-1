"""OCR behind a small interface so PaddleOCR stays optional.

PaddleOCR is heavy to install. It is only imported when ENABLE_OCR=true. When OCR
is disabled, image inputs raise a clear ProcessingError instead of failing late.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import settings
from app.core.exceptions import ProcessingError
from app.core.logging import get_logger

logger = get_logger(__name__)


class OCREngine(ABC):
    @abstractmethod
    def image_to_text(self, data: bytes) -> str: ...


class DisabledOCR(OCREngine):
    """Used when ENABLE_OCR is false."""

    def image_to_text(self, data: bytes) -> str:  # noqa: ARG002
        raise ProcessingError(
            "OCR is disabled. Set ENABLE_OCR=true and install paddleocr to process "
            "images and scanned documents."
        )


class PaddleOCREngine(OCREngine):
    """Lazy PaddleOCR wrapper."""

    def __init__(self) -> None:
        self._ocr = None

    def _engine(self):
        if self._ocr is None:
            from paddleocr import PaddleOCR

            self._ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
            logger.info("PaddleOCR engine initialised")
        return self._ocr

    def image_to_text(self, data: bytes) -> str:
        import numpy as np
        from PIL import Image
        import io

        image = Image.open(io.BytesIO(data)).convert("RGB")
        result = self._engine().ocr(np.array(image), cls=True)
        lines: list[str] = []
        for page in result or []:
            for entry in page or []:
                # entry = [box, (text, confidence)]
                lines.append(entry[1][0])
        return "\n".join(lines)


def get_ocr_engine() -> OCREngine:
    """Factory: returns a real engine only when OCR is enabled."""
    if settings.enable_ocr:
        return PaddleOCREngine()
    return DisabledOCR()
