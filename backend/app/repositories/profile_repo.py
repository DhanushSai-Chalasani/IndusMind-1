"""Data access for user profiles (role source of truth)."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.orm import Profile


class ProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, user_id: uuid.UUID) -> Profile | None:
        return await self._session.get(Profile, user_id)

    async def upsert(self, *, user_id: uuid.UUID, email: str | None, role: str) -> Profile:
        profile = await self._session.get(Profile, user_id)
        if profile is None:
            profile = Profile(id=user_id, email=email or "", role=role)
            self._session.add(profile)
        else:
            if email:
                profile.email = email
            profile.role = role
        await self._session.flush()
        return profile
