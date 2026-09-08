from functools import lru_cache

from app.core.config import get_settings
from app.storage.base import StorageProvider
from app.storage.local import LocalStorage


@lru_cache
def get_storage() -> StorageProvider:
    settings = get_settings()
    driver = settings.storage_driver
    if driver == "local":
        return LocalStorage(settings.storage_dir)
    if driver == "s3":
        if not settings.s3_bucket:
            raise RuntimeError("STORAGE_DRIVER=s3 requires S3_BUCKET")
        from app.storage.s3 import S3Storage

        return S3Storage(bucket=settings.s3_bucket, region=settings.s3_region)
    raise RuntimeError(f"unknown STORAGE_DRIVER: {driver!r}")