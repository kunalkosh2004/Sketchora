import uuid
from datetime import datetime

from pydantic import BaseModel

from app.ai.base import SketchAnalysis


class AnalysisOut(BaseModel):
    design_id: uuid.UUID
    analysis: SketchAnalysis
    created_at: datetime | None = None


class DesignOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    status: str
    sketch_url: str | None
    spec: SketchAnalysis | None
    created_at: datetime