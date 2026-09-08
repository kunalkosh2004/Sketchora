"""Versioned API router.

All v1 endpoints hang off `/api/v1`. New incompatible changes move to v2
instead of breaking existing clients.
"""

from fastapi import APIRouter

from app.api.v1 import auth, projects, uploads

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(uploads.router)


@api_router.get("/health", tags=["system"])
def api_health() -> dict:
    return {"status": "ok", "api": "v1"}