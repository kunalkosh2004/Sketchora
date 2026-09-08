"""Model registry — importing this package registers every table on Base.metadata
so Alembic autogenerate sees the full schema."""

from app.models.design import Design
from app.models.generation import Generation
from app.models.job import Job
from app.models.project import Project
from app.models.user import User

__all__ = ["User", "Project", "Design", "Generation", "Job"]