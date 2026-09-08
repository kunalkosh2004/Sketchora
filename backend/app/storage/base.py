from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageProvider(ABC):
    """Object storage interface.

    `save` returns the public URL clients should use to fetch the object. For
    the local driver that is an API route; for S3 it is a presigned URL, so
    large media never proxies through the API server.
    """

    @abstractmethod
    def save(self, key: str, data: bytes, content_type: str) -> str: ...

    @abstractmethod
    def get_public_url(self, key: str) -> str: ...

    @abstractmethod
    def open(self, key: str) -> BinaryIO: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...