from abc import ABC, abstractmethod

from pydantic import BaseModel, Field


class ProviderError(Exception):
    """Base class for AI provider failures."""


class RetryableProviderError(ProviderError):
    """Transient failures — rate limits, timeouts, upstream 5xx."""


class FatalProviderError(ProviderError):
    """Non-retryable failures — bad requests, auth, rejected content."""


class SketchAnalysis(BaseModel):
    """Structured result of reading a hand-drawn sketch.

    Field names mirror the design specification the studio editor edits, so
    the analysis can seed the editor directly.
    """

    garment: str = Field(description="Garment type, e.g. 'Evening dress'")
    silhouette: str = Field(description="Silhouette, e.g. 'A-line'")
    neckline: str = Field(description="Neckline style, e.g. 'Sweetheart'")
    sleeve: str = Field(description="Sleeve style, e.g. 'Sleeveless'")
    fabric: str = Field(description="Primary fabric, e.g. 'Silk satin'")
    length: str = Field(description="Hem length, e.g. 'Floor'")
    colorway: str = Field(description="Suggested colorway name")
    notes: str = Field(default="", description="Construction and styling notes")


class VisionProvider(ABC):
    """Reads a sketch image and returns a structured garment specification."""

    @abstractmethod
    def analyze_sketch(self, image: bytes, content_type: str) -> SketchAnalysis:
        """Analyze a sketch image. Raises ProviderError subclasses on failure."""
