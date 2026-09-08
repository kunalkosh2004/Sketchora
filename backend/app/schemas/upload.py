import uuid
from datetime import datetime

from pydantic import BaseModel


class SketchOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    status: str
    sketch_url: str
    created_at: datetime