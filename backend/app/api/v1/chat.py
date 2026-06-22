"""Chat history endpoints."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_user
from app.core.exceptions import NotFoundError
from app.models.schemas import (
    ChatMessageOut,
    ChatSessionDetail,
    ChatSessionOut,
    CurrentUser,
)
from app.repositories.chat_repo import ChatRepository

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/sessions", response_model=list[ChatSessionOut])
async def list_sessions(
    user: Annotated[CurrentUser, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ChatSessionOut]:
    sessions = await ChatRepository(db).list_sessions(user_id=user.id)
    return [ChatSessionOut.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_session(
    session_id: uuid.UUID,
    user: Annotated[CurrentUser, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatSessionDetail:
    session = await ChatRepository(db).get_session(session_id, user_id=user.id)
    if session is None:
        raise NotFoundError("Chat session not found")
    return ChatSessionDetail(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        messages=[
            ChatMessageOut.model_validate(m)
            for m in sorted(session.messages, key=lambda x: x.created_at)
        ],
    )
