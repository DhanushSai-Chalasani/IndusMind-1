"""Auth helper endpoints for the frontend (role routing)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import require_user
from app.models.schemas import CurrentUser

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=CurrentUser)
async def me(user: Annotated[CurrentUser, Depends(require_user)]) -> CurrentUser:
    """Return the authenticated user's id, email, and role (admin | user)."""
    return user
