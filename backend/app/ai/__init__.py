"""AI provider abstraction.

The application never talks to a vendor SDK directly — it depends on the
provider interfaces in `app.ai.base` (VisionProvider now; ImageProvider and
VideoProvider in later phases). Swapping Gemini for OpenAI, or Veo for
Runway, is an adapter change, not an application change.
"""