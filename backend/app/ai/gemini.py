"""Gemini vision adapter.

Wraps the Gemini REST API with:
- a hard client timeout (no unbounded provider calls),
- exponential backoff on retryable failures (429/5xx/timeouts),
- fatal-vs-retryable error classification,
- JSON-structured output enforced by the model's response schema.

The rest of the application only ever sees `SketchAnalysis` or
`ProviderError` subclasses — never Gemini types.
"""

import base64
import time

import httpx

from app.ai.base import (
    FatalProviderError,
    RetryableProviderError,
    SketchAnalysis,
    VisionProvider,
)
from app.core.logging import logger

API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent?key={api_key}"
)

PROMPT = (
    "You are a senior fashion designer reading a hand-drawn garment sketch. "
    "Identify the garment's construction and produce the specification as JSON "
    "matching exactly this schema: "
    '{"garment": str, "silhouette": str, "neckline": str, "sleeve": str, '
    '"fabric": str, "length": str, "colorway": str, "notes": str}. '
    "Use professional fashion terminology. Keep notes under 40 words. "
    "Return only the JSON object."
)

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "garment": {"type": "string"},
        "silhouette": {"type": "string"},
        "neckline": {"type": "string"},
        "sleeve": {"type": "string"},
        "fabric": {"type": "string"},
        "length": {"type": "string"},
        "colorway": {"type": "string"},
        "notes": {"type": "string"},
    },
    "required": [
        "garment",
        "silhouette",
        "neckline",
        "sleeve",
        "fabric",
        "length",
        "colorway",
        "notes",
    ],
}

RETRYABLE_STATUS = {429, 500, 502, 503, 504}
MAX_ATTEMPTS = 3
BASE_DELAY_SECONDS = 0.6


class GeminiVisionProvider(VisionProvider):
    def __init__(
        self, api_key: str, model: str = "gemini-2.0-flash", timeout: float = 30.0
    ) -> None:
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def analyze_sketch(self, image: bytes, content_type: str) -> SketchAnalysis:
        url = API_URL.format(model=self.model, api_key=self.api_key)
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": PROMPT},
                        {
                            "inline_data": {
                                "mime_type": content_type,
                                "data": base64.b64encode(image).decode("ascii"),
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": RESPONSE_SCHEMA,
                "temperature": 0.2,
            },
        }

        last_error: Exception | None = None
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                response = httpx.post(
                    url,
                    json=payload,
                    timeout=self.timeout,
                    headers={"Content-Type": "application/json"},
                )
            except httpx.TimeoutException as exc:
                last_error = RetryableProviderError(f"Gemini timeout: {exc}")
            except httpx.HTTPError as exc:
                raise FatalProviderError(f"Gemini request failed: {exc}") from exc
            else:
                if response.status_code == 200:
                    return self._parse(response.json())
                if response.status_code in RETRYABLE_STATUS:
                    last_error = RetryableProviderError(
                        f"Gemini returned {response.status_code}"
                    )
                else:
                    detail = response.text[:300]
                    raise FatalProviderError(
                        f"Gemini rejected the request ({response.status_code}): {detail}"
                    )

            if attempt < MAX_ATTEMPTS:
                delay = BASE_DELAY_SECONDS * (2 ** (attempt - 1))
                logger.warning(
                    "gemini retry",
                    extra={
                        "attempt": attempt,
                        "delay_s": delay,
                        "provider": "gemini",
                        "model": self.model,
                    },
                )
                time.sleep(delay)

        raise last_error or RetryableProviderError("Gemini call failed")

    def _parse(self, body: dict) -> SketchAnalysis:
        try:
            candidate = body["candidates"][0]
            content = candidate["content"]["parts"][0]["text"]
            return SketchAnalysis.model_validate_json(content)
        except (KeyError, IndexError, ValueError) as exc:
            raise FatalProviderError(f"Gemini returned an unusable response: {exc}") from exc