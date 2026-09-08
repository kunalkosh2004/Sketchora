import uuid

import pytest
from fastapi.testclient import TestClient

from app.api.v1.analysis import _analysis_cache
from app.core.config import get_settings
from tests.conftest import auth_headers, register_user

PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c636060f85f0f0002870180ebd24ab00000000049454e44ae426082"
)


def _register(client: TestClient, email: str = "analyst@example.com") -> dict:
    body = register_user(client, email=email)
    return auth_headers(body["access_token"])


def _project_with_sketch(client: TestClient, headers: dict) -> str:
    """Create a project and upload a sketch; returns the design id."""
    project = client.post(
        "/api/v1/projects", json={"name": "Analysis Project"}, headers=headers
    ).json()["id"]
    upload = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("sketch.png", PNG, "image/png")},
        headers=headers,
    )
    assert upload.status_code == 201
    return upload.json()["id"]


@pytest.fixture(autouse=True)
def _mock_provider(monkeypatch):
    """Force the deterministic mock provider and a clean cache per test."""
    monkeypatch.setenv("GOOGLE_API_KEY", "")
    get_settings.cache_clear()
    _analysis_cache.clear()
    yield
    get_settings.cache_clear()
    _analysis_cache.clear()


def test_analyze_requires_auth(client: TestClient):
    response = client.post(
        "/api/v1/designs/00000000-0000-0000-0000-000000000000/analyze"
    )
    assert response.status_code == 401


def test_analyze_unknown_design_404(client: TestClient):
    headers = _register(client)
    response = client.post(
        "/api/v1/designs/00000000-0000-0000-0000-000000000000/analyze",
        headers=headers,
    )
    assert response.status_code == 404


def test_analyze_other_users_design_404(client: TestClient):
    alice = _register(client, "alice-a@example.com")
    bob = _register(client, "bob-a@example.com")
    design_id = _project_with_sketch(client, alice)
    response = client.post(f"/api/v1/designs/{design_id}/analyze", headers=bob)
    assert response.status_code == 404


def test_analyze_without_sketch_409(client: TestClient, db_session):
    from app.models.design import Design
    from app.models.project import Project
    from app.models.user import User

    headers = _register(client)
    user = db_session.query(User).filter_by(email="analyst@example.com").one()
    project = Project(name="No Sketch", owner_id=user.id)
    db_session.add(project)
    db_session.flush()
    design = Design(project_id=project.id, name="Bare", status="draft")
    db_session.add(design)
    db_session.commit()

    response = client.post(f"/api/v1/designs/{design.id}/analyze", headers=headers)
    assert response.status_code == 409


def test_analyze_returns_full_spec(client: TestClient):
    headers = _register(client)
    design_id = _project_with_sketch(client, headers)
    response = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert response.status_code == 200
    body = response.json()
    spec = body["analysis"]
    for field in (
        "garment",
        "silhouette",
        "neckline",
        "sleeve",
        "fabric",
        "length",
        "colorway",
        "notes",
    ):
        assert spec[field], f"{field} should be filled"
    assert str(body["design_id"]) == design_id
    assert body["created_at"]


def test_analyze_design_status_becomes_analyzed(client: TestClient, db_session):
    headers = _register(client)
    design_id = _project_with_sketch(client, headers)
    response = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert response.status_code == 200

    from app.models.design import Design

    design = db_session.get(Design, uuid.UUID(design_id))
    assert design.status == "analyzed"
    assert design.spec is not None
    assert design.analyzed_at is not None


def test_analyze_is_idempotent_and_cached(client: TestClient, monkeypatch):
    headers = _register(client)
    design_id = _project_with_sketch(client, headers)

    calls = []
    from app.ai import mock as mock_module

    real_analyze = mock_module.MockVisionProvider.analyze_sketch

    def counting_analyze(self, image, content_type):
        calls.append(1)
        return real_analyze(self, image, content_type)

    monkeypatch.setattr(mock_module.MockVisionProvider, "analyze_sketch", counting_analyze)

    first = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert first.status_code == 200
    second = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert second.status_code == 200
    assert first.json()["analysis"] == second.json()["analysis"]
    # Second call is served from the stored spec — the provider runs once.
    assert len(calls) == 1


def test_identical_sketches_share_cache_entry(client: TestClient):
    headers = _register(client)
    _project_with_sketch(client, headers)
    assert len(_analysis_cache) == 0  # not analyzed yet

    client.post(
        f"/api/v1/designs/{_project_with_sketch(client, headers)}/analyze",
        headers=headers,
    )
    assert len(_analysis_cache) == 1


def test_analyze_fatal_provider_error_maps_to_502(client: TestClient, monkeypatch):
    from app.ai import base as base_module

    class FailingProvider(base_module.VisionProvider):
        def analyze_sketch(self, image, content_type):
            raise base_module.FatalProviderError("boom")

    monkeypatch.setattr("app.ai.factory.get_vision_provider", lambda: FailingProvider())

    headers = _register(client)
    design_id = _project_with_sketch(client, headers)
    response = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert response.status_code == 502


def test_analyze_retryable_provider_error_maps_to_503(client: TestClient, monkeypatch):
    from app.ai import base as base_module

    class BusyProvider(base_module.VisionProvider):
        def analyze_sketch(self, image, content_type):
            raise base_module.RetryableProviderError("busy")

    monkeypatch.setattr("app.ai.factory.get_vision_provider", lambda: BusyProvider())

    headers = _register(client)
    design_id = _project_with_sketch(client, headers)
    response = client.post(f"/api/v1/designs/{design_id}/analyze", headers=headers)
    assert response.status_code == 503


def test_cache_evicts_oldest_when_full():
    from app.api.v1.analysis import CACHE_MAX_ENTRIES, store_analysis_cache

    for i in range(CACHE_MAX_ENTRIES + 10):
        store_analysis_cache(f"key-{i}", f"value-{i}")
    assert len(_analysis_cache) == CACHE_MAX_ENTRIES
    assert "key-0" not in _analysis_cache  # oldest evicted
    assert "key-9" not in _analysis_cache
    _analysis_cache.clear()
