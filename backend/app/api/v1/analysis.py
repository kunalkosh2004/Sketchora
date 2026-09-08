"""Sketch analysis endpoint.

Reads an uploaded sketch through the VisionProvider abstraction and stores
the resulting specification on the design. Expensive provider calls are
deduplicated with a deterministic cache: hash(sketch bytes + analysis
configuration) so identical sketches never pay twice.
"""

import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.base import (
    FatalProviderError,
    RetryableProviderError,
    SketchAnalysis,
)
from app.api.deps import get_current_user, get_owned_project
from app.core.config import get_settings
from app.core.db import get_db
from app.models.design import Design
from app.models.user import User
from app.schemas.analysis import AnalysisOut
from app.storage.factory import get_storage

router = APIRouter(prefix="/designs", tags=["analysis"])

# In-memory analysis cache keyed by sketch hash. Swap for Redis when the job
# phase lands — the key format and semantics stay identical.
_analysis_cache: dict[str, SketchAnalysis] = {}
CACHE_MAX_ENTRIES = 512


def analysis_cache_key(sketch: bytes, spec_version: int) -> str:
    settings = get_settings()
    digest = hashlib.sha256()
    digest.update(sketch)
    digest.update(settings.google_api_key.encode() if settings.google_api_key else b"mock")
    digest.update(str(spec_version).encode())
    return digest.hexdigest()


def get_cached_analysis(key: str) -> SketchAnalysis | None:
    return _analysis_cache.get(key)


def store_analysis_cache(key: str, analysis: SketchAnalysis) -> None:
    if len(_analysis_cache) >= CACHE_MAX_ENTRIES:
        _analysis_cache.pop(next(iter(_analysis_cache)))
    _analysis_cache[key] = analysis


def _analyze_with_cache(sketch: bytes) -> SketchAnalysis:
    key = analysis_cache_key(sketch, spec_version=1)
    cached = get_cached_analysis(key)
    if cached is not None:
        return cached
    from app.ai.factory import get_vision_provider

    try:
        analysis = get_vision_provider().analyze_sketch(sketch, "image/png")
    except FatalProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="We couldn't read this sketch right now. Please try again.",
        ) from exc
    except RetryableProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The sketch reader is busy. Please try again in a moment.",
        ) from exc
    store_analysis_cache(key, analysis)
    return analysis


@router.post("/{design_id}/analyze", response_model=AnalysisOut)
def analyze_sketch(
    design_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalysisOut:
    design = _get_owned_design(design_id, current_user, db)

    if design.spec is not None:
        # Idempotent: already-analyzed designs return the stored spec.
        return AnalysisOut(
            design_id=design.id,
            analysis=SketchAnalysis.model_validate(design.spec),
            created_at=design.analyzed_at,
        )

    if not design.sketch_key:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This design has no sketch yet — upload one first",
        )

    sketch = _load_sketch(design.sketch_key)
    analysis = _analyze_with_cache(sketch)

    design.spec = analysis.model_dump()
    design.analyzed_at = _utcnow()
    design.status = "analyzed"
    db.commit()

    return AnalysisOut(
        design_id=design.id,
        analysis=analysis,
        created_at=design.analyzed_at,
    )


def _get_owned_design(design_id: uuid.UUID, user: User, db: Session) -> Design:
    design = db.get(Design, design_id)
    if design is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Design not found"
        )
    # Ownership flows through the design's project.
    get_owned_project(design.project_id, user, db)
    return design


def _load_sketch(key: str) -> bytes:
    storage = get_storage()
    try:
        with storage.open(key) as handle:
            return handle.read()
    except (ValueError, FileNotFoundError, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The sketch file is missing from storage — re-upload it",
        ) from exc


def _utcnow():
    from datetime import UTC, datetime

    return datetime.now(UTC)