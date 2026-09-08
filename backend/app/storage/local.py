from pathlib import Path
from typing import BinaryIO

from app.core.config import get_settings
from app.storage.base import StorageProvider


class LocalStorage(StorageProvider):
    """Filesystem-backed storage.

    Keys are treated as relative paths inside the storage root; every access
    re-validates that the resolved path stays inside the root, so keys can
    never escape (path traversal prevention).
    """

    def __init__(self, root: str | Path | None = None) -> None:
        self.root = Path(root or get_settings().storage_dir).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _resolve(self, key: str) -> Path:
        # Reject obvious traversal first, then verify the resolved path.
        if ".." in key.split("/") or key.startswith("/"):
            raise ValueError("invalid storage key")
        candidate = (self.root / key).resolve()
        if not candidate.is_relative_to(self.root):
            raise ValueError("invalid storage key")
        return candidate

    def save(self, key: str, data: bytes, content_type: str) -> str:
        path = self._resolve(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return self.get_public_url(key)

    def get_public_url(self, key: str) -> str:
        return f"/media/{key}"

    def path(self, key: str) -> Path:
        """Resolve a key to a path inside the root (safe for direct serving)."""
        return self._resolve(key)

    def open(self, key: str) -> BinaryIO:
        return self._resolve(key).open("rb")

    def delete(self, key: str) -> None:
        path = self._resolve(key)
        if path.exists():
            path.unlink()