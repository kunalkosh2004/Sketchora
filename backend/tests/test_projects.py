import uuid

from fastapi.testclient import TestClient

from tests.conftest import auth_headers, register_user


def _register(client: TestClient, email: str) -> tuple[str, dict]:
    body = register_user(client, email=email)
    return body["access_token"], auth_headers(body["access_token"])


def test_projects_require_auth(client: TestClient):
    assert client.get("/api/v1/projects").status_code == 401
    assert client.post("/api/v1/projects", json={"name": "X"}).status_code == 401


def test_create_and_list_projects(client: TestClient):
    _, headers = _register(client, "owner@example.com")
    created = client.post(
        "/api/v1/projects", json={"name": "Midnight Collection"}, headers=headers
    )
    assert created.status_code == 201
    body = created.json()
    assert body["name"] == "Midnight Collection"
    assert body["status"] == "sketched"
    assert body["id"]

    listed = client.get("/api/v1/projects", headers=headers)
    assert listed.status_code == 200
    assert [p["id"] for p in listed.json()] == [body["id"]]


def test_create_with_custom_status(client: TestClient):
    _, headers = _register(client, "status@example.com")
    response = client.post(
        "/api/v1/projects", json={"name": "Look 04", "status": "generating"}, headers=headers
    )
    assert response.status_code == 201
    assert response.json()["status"] == "generating"


def test_create_rejects_unknown_status(client: TestClient):
    _, headers = _register(client, "badstatus@example.com")
    response = client.post(
        "/api/v1/projects", json={"name": "X", "status": "on-fire"}, headers=headers
    )
    assert response.status_code == 422


def test_users_only_see_their_own_projects(client: TestClient):
    _, alice_headers = _register(client, "alice@example.com")
    _, bob_headers = _register(client, "bob@example.com")

    alice_project = client.post(
        "/api/v1/projects", json={"name": "Alice Only"}, headers=alice_headers
    ).json()

    bob_list = client.get("/api/v1/projects", headers=bob_headers)
    assert bob_list.json() == []

    alice_list = client.get("/api/v1/projects", headers=alice_headers)
    assert [p["id"] for p in alice_list.json()] == [alice_project["id"]]


def test_get_project_ownership(client: TestClient):
    _, alice_headers = _register(client, "alice2@example.com")
    _, bob_headers = _register(client, "bob2@example.com")
    alice_project = client.post(
        "/api/v1/projects", json={"name": "Secret"}, headers=alice_headers
    ).json()

    own = client.get(f"/api/v1/projects/{alice_project['id']}", headers=alice_headers)
    assert own.status_code == 200
    assert own.json()["name"] == "Secret"

    # Bob must not see it — 404, not 403, so existence stays hidden.
    foreign = client.get(f"/api/v1/projects/{alice_project['id']}", headers=bob_headers)
    assert foreign.status_code == 404


def test_update_project_ownership(client: TestClient):
    _, alice_headers = _register(client, "alice3@example.com")
    _, bob_headers = _register(client, "bob3@example.com")
    alice_project = client.post(
        "/api/v1/projects", json={"name": "Rename Me"}, headers=alice_headers
    ).json()

    renamed = client.patch(
        f"/api/v1/projects/{alice_project['id']}",
        json={"name": "Renamed"},
        headers=alice_headers,
    )
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Renamed"

    foreign_patch = client.patch(
        f"/api/v1/projects/{alice_project['id']}",
        json={"name": "Hijack"},
        headers=bob_headers,
    )
    assert foreign_patch.status_code == 404


def test_delete_project_ownership(client: TestClient):
    _, alice_headers = _register(client, "alice4@example.com")
    _, bob_headers = _register(client, "bob4@example.com")
    alice_project = client.post(
        "/api/v1/projects", json={"name": "Delete Me"}, headers=alice_headers
    ).json()

    assert (
        client.delete(f"/api/v1/projects/{alice_project['id']}", headers=bob_headers).status_code
        == 404
    )
    assert (
        client.delete(f"/api/v1/projects/{alice_project['id']}", headers=alice_headers).status_code
        == 204
    )
    listed = client.get("/api/v1/projects", headers=alice_headers)
    assert listed.json() == []


def test_unknown_project_id_404(client: TestClient):
    _, headers = _register(client, "ghost@example.com")
    response = client.get(f"/api/v1/projects/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404