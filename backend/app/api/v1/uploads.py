import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_project
from app.core.config import get_settings
from app.core.db import get_db
from app.models.design import Design
from app.models.user import User
from app.schemas.upload import SketchOut
from app.storage.factory import get_storage

router = APIRouter(prefix="/projects", tags=["uploads"])

ALLOWED_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# Magic bytes sniffing — the declared content type is never trusted alone.
_MAGIC: dict[str, bytes] = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",  # further verified by the WEBP marker at offset 8
}


def _sniffs_as(data: bytes, content_type: str) -> bool:
    if content_type == "image/webp":
        return data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    magic = _MAGIC.get(content_type)
    return magic is not None and data.startswith(magic)


@router.post("/{project_id}/sketch", response_model=SketchOut, status_code=status.HTTP_201_CREATED)
async def upload_sketch(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SketchOut:
    project = get_owned_project(project_id, current_user, db)
    settings = get_settings()

    declared = (file.content_type or "").lower()
    extension = ALLOWED_TYPES.get(declared)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPG, PNG, or WEBP images are supported",
        )

    # Stream the upload in chunks so large files are rejected without being
    # buffered into memory.
    head = await file.read(16)
    if not _sniffs_as(head, declared):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File contents do not match the declared image type",
        )

    chunks = [head]
    size = len(head)
    while size <= settings.upload_max_bytes:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        chunks.append(chunk)
        size += len(chunk)
    if size > settings.upload_max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image is larger than 10 MB",
        )

    stem = (file.filename or "sketch").rsplit(".", 1)[0][:100] or "sketch"
    design = Design(project_id=project.id, name=stem, status="sketched")
    db.add(design)
    db.flush()

    key = f"sketches/{current_user.id}/{design.id}{extension}"
    data = b"".join(chunks)
    sketch_url = get_storage().save(key, data, declared)
    design.sketch_key = key
    design.sketch_content_type = declared

    db.commit()
    db.refresh(design)
    return SketchOut(
        id=design.id,
        project_id=design.project_id,
        name=design.name,
        status=design.status,
        sketch_url=sketch_url,
        created_at=design.created_at,
    )