# Sketchora — Architecture

## Shape

A **modular monolith**: one FastAPI process containing clear domain
boundaries (`auth`, `projects`, `designs`, `generations`, `jobs`, `ai`,
`storage`, `media`) that can be extracted into services later if the product
grows. No microservices unless scale demands them.

```
Load balancer (future)
      ↓
Multiple FastAPI instances (stateless)      ← horizontal scaling is a config change
      ↓                    ↓
PostgreSQL              Redis (jobs, cache)
      ↓                    ↓
   Celery workers      AI providers (Gemini / OpenAI / Veo / Runway)
      ↓
 Object storage (local / S3 abstraction)
```

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind v4 | see `frontend/DESIGN_SYSTEM.md` |
| API | FastAPI + Pydantic v2 | typed contracts, async-capable, auto docs |
| ORM / migrations | SQLAlchemy 2.x + Alembic | mature, sync sessions shared with Celery workers |
| Database | PostgreSQL 17 | source of truth; UUIDs, JSONB specs, FKs, indexes |
| Queue | Redis 7 → Celery | async jobs, retries, idempotency (introduced when jobs earn their place) |
| Auth | JWT (PyJWT) + Argon2 (pwdlib) | stateless tokens, modern KDF |
| Media | StorageProvider abstraction (Local / S3) | API never proxies large files |
| AI | VisionProvider / ImageProvider / VideoProvider interfaces | never coupled to one vendor |
| Container | Docker Compose (postgres, redis, backend, frontend) | one-command dev environment |

## API

- Versioned: everything hangs off `/api/v1`.
- Stateless: auth is a signed JWT; no server-side sessions.
- Sync SQLAlchemy sessions per request (FastAPI threadpool). Celery workers
  (sync) share the same models, so there is no duplicated data layer.

## Data model

```
users ──1:N── projects ──1:N── designs ──1:N── versions
  │                          │
  │                          └──1:N── generations ──1:N── variations
  └──1:N── jobs
```

- UUID primary keys, `created_at`/`updated_at` timestamps.
- Design specifications are versioned JSON (never destructive saves).
- PostgreSQL is never used as a blob store — media lives in object storage.

## Reliability concepts (introduced when they earn their place)

- Idempotency keys on expensive operations (analysis, generation).
- Async jobs with status tracking (QUEUED → PROCESSING → COMPLETED/FAILED),
  retries with exponential backoff, dead-letter handling.
- Provider timeouts, retryable-vs-non-retryable error classes, circuit
  breakers around flaky providers.
- Rate limiting, upload validation (MIME, size), ownership checks on every
  resource, CORS, no secrets in code or logs.

## Observability

Structured JSON logs with request IDs (`X-Request-ID`), job IDs, generation
IDs, latency and provider metrics. Secrets are never logged.

## Development phases

1. ✅ Foundation (FastAPI, health, Docker)
2. Auth + database (users, projects, ownership)
3. Sketch upload (validation, storage abstraction)
4. Gemini sketch analysis (provider abstraction)
5. Design editor (versioned specifications)
6. Image generation (async jobs)
7. Generation history + variations
8. Image editing
9. Video generation
10. GIF generation
11. Production polish (SSE, rate limiting, metrics, docs)

Each phase ships tested and committed before the next begins.