from app.ai.base import VisionProvider
from app.ai.mock import MockVisionProvider
from app.core.config import get_settings


def get_vision_provider() -> VisionProvider:
    """Resolve the vision provider from configuration.

    - GOOGLE_API_KEY set  → Gemini
    - otherwise           → deterministic Mock (tests, offline dev)

    Adding a vendor means adding an adapter and a branch here — nothing else
    in the application changes.
    """
    settings = get_settings()
    if settings.google_api_key:
        from app.ai.gemini import GeminiVisionProvider

        return GeminiVisionProvider(api_key=settings.google_api_key)
    return MockVisionProvider()