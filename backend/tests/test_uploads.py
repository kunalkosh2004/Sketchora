
from fastapi.testclient import TestClient

from tests.conftest import auth_headers, register_user

PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c636060f85f0f0002870180ebd24ab00000000049454e44ae426082"
)

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32


def _project_id(client: TestClient, headers: dict) -> str:
    return client.post(
        "/api/v1/projects", json={"name": "Upload Project"}, headers=headers
    ).json()["id"]


def _register(client: TestClient, email: str = "uploader@example.com") -> tuple[str, dict]:
    body = register_user(client, email=email)
    return body["access_token"], auth_headers(body["access_token"])


def test_upload_requires_auth(client: TestClient):
    response = client.post(
        "/api/v1/projects/00000000-0000-0000-0000-000000000000/sketch",
        files={"file": ("sketch.png", PNG, "image/png")},
    )
    assert response.status_code == 401


def test_upload_requires_own_project(client: TestClient):
    _, alice_headers = _register(client, "alice-u@example.com")
    _, bob_headers = _register(client, "bob-u@example.com")
    project = _project_id(client, alice_headers)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("sketch.png", PNG, "image/png")},
        headers=bob_headers,
    )
    assert response.status_code == 404


def test_upload_valid_png(client: TestClient):
    _, headers = _register(client)
    project = _project_id(client, headers)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("my-sketch.png", PNG, "image/png")},
        headers=headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "my-sketch"
    assert body["status"] == "sketched"
    assert body["sketch_url"].startswith("/media/sketches/")


def test_upload_valid_jpeg(client: TestClient):
    _, headers = _register(client, "jpeg@example.com")
    project = _project_id(client, headers)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("sketch.jpg", JPEG, "image/jpeg")},
        headers=headers,
    )
    assert response.status_code == 201
    assert response.json()["sketch_url"].endswith(".jpg")


def test_upload_rejects_unsupported_type(client: TestClient):
    _, headers = _register(client, "txt@example.com")
    project = _project_id(client, headers)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
        headers=headers,
    )
    assert response.status_code == 415


def test_upload_rejects_spoofed_content_type(client: TestClient):
    """Declaring image/png but sending non-PNG bytes must fail."""
    _, headers = _register(client, "spoof@example.com")
    project = _project_id(client, headers)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("fake.png", b"definitely not a png", "image/png")},
        headers=headers,
    )
    assert response.status_code == 415


def test_upload_rejects_oversize_file(client: TestClient):
    _, headers = _register(client, "big@example.com")
    project = _project_id(client, headers)
    # 10 MB limit + 1 byte, with a valid PNG header so only the size trips.
    payload = PNG + b"\x00" * (10 * 1024 * 1024)
    response = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("huge.png", payload, "image/png")},
        headers=headers,
    )
    assert response.status_code == 413


def test_uploaded_file_is_served_back(client: TestClient):
    _, headers = _register(client, "serve@example.com")
    project = _project_id(client, headers)
    uploaded = client.post(
        f"/api/v1/projects/{project}/sketch",
        files={"file": ("sketch.png", PNG, "image/png")},
        headers=headers,
    ).json()
    served = client.get(uploaded["sketch_url"])
    assert served.status_code == 200
    assert served.content == PNG
    assert served.headers["content-type"] == "image/png"
    assert "immutable" in served.headers["cache-control"]


def test_media_route_blocks_traversal(client: TestClient):
    for evil in ["../secret.txt", "..%2fsecret.txt", "sketches/../../secret"]:
        response = client.get(f"/media/{evil}")
        assert response.status_code in (404, 400)


def test_sketch_is_stored_under_owned_project_path(client: TestClient, tmp_path):
    from app.storage.local import LocalStorage

    storage = LocalStorage(tmp_path)
    key = "sketches/user-1/design-1.png"
    url = storage.save(key, PNG, "image/png")
    assert url == f"/media/{key}"
    assert (tmp_path / key).exists()
    with storage.open(key) as handle:
        assert handle.read() == PNG


def test_local_storage_blocks_escaping_keys(tmp_path):
    from app.storage.local import LocalStorage

    storage = LocalStorage(tmp_path)
    for evil in ["../escape.txt", "a/../../escape.txt", "/abs/path.txt"]:
        try:
            storage.save(evil, b"x", "text/plain")
            raise AssertionError(f"key {evil!r} should have been rejected")
        except ValueError:
            pass


def test_s3_storage_uses_presigned_urls():
    from app.storage.s3 import S3Storage

    class FakeClient:
        def __init__(self):
            self.calls = []

        def put_object(self, **kwargs):
            self.calls.append(("put", kwargs))

        def generate_presigned_url(self, method, Params, ExpiresIn):
            assert method == "get_object"
            return f"https://bucket.s3.amazonaws.com/{Params['Key']}?sig=1"

        def delete_object(self, **kwargs):
            self.calls.append(("delete", kwargs))

    storage = S3Storage(bucket="test-bucket")
    storage.client = FakeClient()
    url = storage.save("sketches/1.png", b"data", "image/png")
    assert url.startswith("https://bucket.s3.amazonaws.com/sketches/1.png")
    assert storage.client.calls[0][0] == "put"
    assert storage.client.calls[0][1]["Bucket"] == "test-bucket"
    assert storage.client.calls[0][1]["ContentType"] == "image/png"
    storage.delete("sketches/1.png")
    assert storage.client.calls[1][0] == "delete"