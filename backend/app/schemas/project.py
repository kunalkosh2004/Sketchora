import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.project import PROJECT_STATUSES


def _validate_status(status: str | None) -> str | None:
    if status is None:
        return None
    if status not in PROJECT_STATUSES:
        raise ValueError(f"status must be one of {PROJECT_STATUSES}")
    return status


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def check_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def check_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    status: str
    created_at: datetime
    updated_at: datetime