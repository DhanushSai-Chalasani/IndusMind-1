"""Domain exceptions and FastAPI exception handlers."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base class for all domain errors. Maps to an HTTP response."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str | None = None, *, code: str | None = None):
        self.message = message or self.__doc__ or "Unexpected error"
        if code:
            self.code = code
        super().__init__(self.message)


class NotFoundError(AppError):
    """Requested resource was not found."""

    status_code = 404
    code = "not_found"


class UnsupportedFileTypeError(AppError):
    """The uploaded file type is not supported."""

    status_code = 415
    code = "unsupported_file_type"


class ProcessingError(AppError):
    """Document processing failed."""

    status_code = 422
    code = "processing_error"


class EmbeddingError(AppError):
    """Embedding generation failed."""

    status_code = 502
    code = "embedding_error"


class LLMError(AppError):
    """The language model call failed."""

    status_code = 502
    code = "llm_error"


class AuthError(AppError):
    """Authentication failed or token is invalid."""

    status_code = 401
    code = "unauthorized"


class ForbiddenError(AppError):
    """The authenticated user lacks permission for this action."""

    status_code = 403
    code = "forbidden"


class ConfigurationError(AppError):
    """A required configuration value is missing."""

    status_code = 500
    code = "configuration_error"


def register_exception_handlers(app: FastAPI) -> None:
    """Attach handlers that turn domain errors into structured JSON responses."""

    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        if exc.status_code >= 500:
            logger.exception("AppError: %s", exc.message)
        else:
            logger.warning("AppError (%s): %s", exc.code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "internal_error", "message": "Internal server error"}},
        )
