from fastapi.testclient import TestClient

from app.main import create_app


def make_client() -> TestClient:
    return TestClient(create_app())


def test_health_ok():
    with make_client() as client:
        response = client.get("/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ok"
        assert "X-Request-ID" in response.headers


def test_versioned_health_ok():
    with make_client() as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "api": "v1"}


def test_root_info():
    with make_client() as client:
        response = client.get("/")
        assert response.status_code == 200
        body = response.json()
        assert body["docs"] == "/docs"
        assert body["health"] == "/health"


def test_docs_reachable():
    with make_client() as client:
        assert client.get("/docs").status_code == 200


def test_cors_preflight_allows_frontend():
    with make_client() as client:
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == (
            "http://localhost:3000"
        )


def test_request_ids_are_unique_per_request():
    with make_client() as client:
        first = client.get("/health").headers["X-Request-ID"]
        second = client.get("/health").headers["X-Request-ID"]
        assert first != second


def test_inbound_request_id_is_echoed():
    with make_client() as client:
        response = client.get("/health", headers={"X-Request-ID": "abc123"})
        assert response.headers["X-Request-ID"] == "abc123"


def test_unknown_route_404():
    with make_client() as client:
        assert client.get("/nope").status_code == 404