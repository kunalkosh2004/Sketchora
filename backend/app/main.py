"""Application entry point.

A modular monolith: the app factory wires middleware, routers, and lifecycle
hooks. Domain boundaries live under `app/` (auth, projects, designs,
generations, jobs, ai, storage, media) so services can be extracted later if
the product grows.
"""

import logging
import mimetypes
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app import __version__
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.storage.factory import get_storage

logger = logging.getLogger("sketchora")


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging()

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        logger.info(
            "api started",
            extra={"service": "api", "environment": settings.environment},
        )
        yield
        logger.info("api stopped", extra={"service": "api"})

    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def request_context(request: Request, call_next):
        # Accept an inbound request ID or mint one; never log secrets.
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response

    @app.get("/media/{key:path}", tags=["system"])
    def media(key: str) -> FileResponse:
        """Serve locally-stored media.

        Only meaningful for the local storage driver — S3 returns presigned
        URLs, so media never proxies through the API server.
        """
        storage = get_storage()
        if not hasattr(storage, "path"):
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Media is served from object storage, not the API",
            )
        try:
            path = storage.path(key)
        except (ValueError, FileNotFoundError) as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Media not found"
            ) from exc
        media_type = mimetypes.guess_type(key)[0] or "application/octet-stream"
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )

    @app.get("/", include_in_schema=False)
    def root() -> dict:
        return {
            "name": settings.app_name,
            "version": __version__,
            "docs": "/docs",
            "health": "/health",
        }

    @app.get("/health", tags=["system"])
    def health() -> dict:
        return {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.environment,
        }

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()