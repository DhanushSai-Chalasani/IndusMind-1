"""Data access for chat sessions and messages."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.orm import ChatMessage, ChatSession


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_session(
        self, *, user_id: uuid.UUID, title: str | None = None
    ) -> ChatSession:
        chat = ChatSession(user_id=user_id, title=title)
        self._session.add(chat)
        await self._session.flush()
        return chat

    async def get_session(
        self, session_id: uuid.UUID, *, user_id: uuid.UUID
    ) -> ChatSession | None:
        stmt = (
            select(ChatSession)
            .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .options(selectinload(ChatSession.messages))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_sessions(self, *, user_id: uuid.UUID) -> list[ChatSession]:
        stmt = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.created_at.desc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def add_message(
        self,
        *,
        session_id: uuid.UUID,
        role: str,
        content: str,
        sources: list | dict | None = None,
    ) -> ChatMessage:
        msg = ChatMessage(
            session_id=session_id, role=role, content=content, sources=sources
        )
        self._session.add(msg)
        await self._session.flush()
        return msg
