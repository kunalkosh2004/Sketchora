"""Versioned API router.

All v1 endpoints hang off `/api/v1`. New incompatible changes move to v2
instead of breaking existing clients.
"""

from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/health", tags=["system"])
def api_health() -> dict:
    return {"status": "ok", "api": "v1"}