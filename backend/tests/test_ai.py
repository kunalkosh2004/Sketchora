import httpx
import pytest

from app.ai.base import FatalProviderError, RetryableProviderError, SketchAnalysis
from app.ai.factory import get_vision_provider
from app.ai.gemini import GeminiVisionProvider
from app.ai.mock import MockVisionProvider

PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c636060f85f0f0002870180ebd24ab00000000049454e44ae426082"
)


def test_mock_provider_is_deterministic():
    provider = MockVisionProvider()
    first = provider.analyze_sketch(PNG, "image/png")
    second = provider.analyze_sketch(PNG, "image/png")
    assert first == second


def test_mock_provider_returns_full_spec():
    analysis = MockVisionProvider().analyze_sketch(PNG, "image/png")
    assert isinstance(analysis, SketchAnalysis)
    assert analysis.garment
    assert analysis.silhouette
    assert analysis.neckline
    assert analysis.fabric


def test_factory_returns_mock_without_api_key(monkeypatch):
    monkeypatch.setenv("GOOGLE_API_KEY", "")
    from app.core.config import get_settings

    get_settings.cache_clear()
    provider = get_vision_provider()
    assert isinstance(provider, MockVisionProvider)
    get_settings.cache_clear()


def _gemini_response(payload: dict, status_code: int = 200) -> httpx.Response:
    return httpx.Response(status_code=status_code, json=payload, request=httpx.Request("POST", "http://test"))


def _ok_body(analysis: SketchAnalysis) -> dict:
    return {
        "candidates": [
            {"content": {"parts": [{"text": analysis.model_dump_json()}]}}
        ]
    }


def test_gemini_parses_structured_response(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")
    expected = SketchAnalysis(
        garment="Evening dress",
        silhouette="A-line",
        neckline="Sweetheart",
        sleeve="Sleeveless",
        fabric="Silk satin",
        length="Floor",
        colorway="Noir",
        notes="Clean lines.",
    )
    calls = []

    def fake_post(url, json=None, timeout=None, headers=None):
        calls.append(1)
        return _gemini_response(_ok_body(expected))

    monkeypatch.setattr(httpx, "post", fake_post)
    result = provider.analyze_sketch(PNG, "image/png")
    assert result == expected
    assert len(calls) == 1


def test_gemini_retries_on_429_then_succeeds(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")
    expected = MockVisionProvider().analyze_sketch(PNG, "image/png")
    attempts = []

    def fake_post(url, json=None, timeout=None, headers=None):
        attempts.append(1)
        if len(attempts) == 1:
            return _gemini_response({}, status_code=429)
        return _gemini_response(_ok_body(expected))

    monkeypatch.setattr(httpx, "post", fake_post)
    monkeypatch.setattr("app.ai.gemini.time.sleep", lambda s: None)
    result = provider.analyze_sketch(PNG, "image/png")
    assert result == expected
    assert len(attempts) == 2


def test_gemini_gives_up_after_max_retries(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")

    def fake_post(url, json=None, timeout=None, headers=None):
        return _gemini_response({}, status_code=503)

    monkeypatch.setattr(httpx, "post", fake_post)
    monkeypatch.setattr("app.ai.gemini.time.sleep", lambda s: None)
    with pytest.raises(RetryableProviderError):
        provider.analyze_sketch(PNG, "image/png")


def test_gemini_fatal_on_auth_error(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")

    def fake_post(url, json=None, timeout=None, headers=None):
        return _gemini_response({"error": "bad key"}, status_code=403)

    monkeypatch.setattr(httpx, "post", fake_post)
    with pytest.raises(FatalProviderError):
        provider.analyze_sketch(PNG, "image/png")


def test_gemini_timeout_is_retryable(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")

    def fake_post(url, json=None, timeout=None, headers=None):
        raise httpx.TimeoutException("timed out")

    monkeypatch.setattr(httpx, "post", fake_post)
    monkeypatch.setattr("app.ai.gemini.time.sleep", lambda s: None)
    with pytest.raises(RetryableProviderError):
        provider.analyze_sketch(PNG, "image/png")


def test_gemini_fatal_on_unparseable_response(monkeypatch):
    provider = GeminiVisionProvider(api_key="test-key")

    def fake_post(url, json=None, timeout=None, headers=None):
        return _gemini_response({"candidates": []})

    monkeypatch.setattr(httpx, "post", fake_post)
    with pytest.raises(FatalProviderError):
        provider.analyze_sketch(PNG, "image/png")