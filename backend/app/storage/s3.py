from typing import BinaryIO

from app.storage.base import StorageProvider


class S3Storage(StorageProvider):
    """S3-backed storage.

    Requires `S3_BUCKET` (and standard AWS credentials) in the environment.
    Public access is via presigned GET URLs, so media never flows through the
    API server — the S3 driver is CDN-ready by construction.
    """

    def __init__(self, bucket: str, region: str | None = None) -> None:
        try:
            import boto3  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "boto3 is required for S3 storage — add it to requirements"
            ) from exc
        self.bucket = bucket
        self.client = boto3.client("s3", region_name=region)

    def _key_or_raise(self, key: str) -> None:
        if ".." in key.split("/") or key.startswith("/"):
            raise ValueError("invalid storage key")

    def save(self, key: str, data: bytes, content_type: str) -> str:
        self._key_or_raise(key)
        self.client.put_object(
            Bucket=self.bucket, Key=key, Body=data, ContentType=content_type
        )
        return self.get_public_url(key)

    def get_public_url(self, key: str) -> str:
        self._key_or_raise(key)
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=3600,
        )

    def open(self, key: str) -> BinaryIO:  # pragma: no cover - exercised via URL
        self._key_or_raise(key)
        import io

        body = self.client.get_object(Bucket=self.bucket, Key=key)["Body"]
        return io.BytesIO(body.read())

    def delete(self, key: str) -> None:
        self._key_or_raise(key)
        self.client.delete_object(Bucket=self.bucket, Key=key)