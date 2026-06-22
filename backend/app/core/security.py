"""Supabase JWT verification."""
from __future__ import annotations

import jwt

from app.core.config import settings
from app.core.exceptions import AuthError


def decode_supabase_jwt(token: str) -> dict:
    """Verify and decode a Supabase-issued JWT (HS256).

    Returns the token payload. Raises AuthError if the token is missing,
    expired, or has an invalid signature.
    """
    if not token:
        raise AuthError("Missing authentication token")
    if not settings.supabase_jwt_secret:
        raise AuthError("JWT secret not configured on the server", code="configuration_error")

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": True},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthError("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError("Invalid authentication token") from exc

    return payload
