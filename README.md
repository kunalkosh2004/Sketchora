# Sketchora

Sketchora transforms hand-drawn fashion sketches into realistic designs,
editable variations, and animated fashion visuals using multimodal AI.

**Tagline:** From paper sketches to visual reality.

## Status

| Phase | State |
| --- | --- |
| Frontend foundation — landing page + design system | ✅ committed |
| Dashboard — project grid, new-design flow, ⌘K, mobile nav | ✅ committed |
| Studio / design workspace | ⏳ next |
| Backend (FastAPI, PostgreSQL, auth) | pending |
| AI pipeline (analysis, generation, animation) | pending |

See `frontend/DESIGN_SYSTEM.md` for the design system that all future screens
follow, and `frontend/README.md` for frontend commands.

## Product

- Upload a hand-drawn sketch → AI reads silhouette, neckline, fabric, construction
- Structured, editable design specification
- Realistic garment visualizations, variations, plain-language editing
- Animation → MP4 / GIF

## Architecture

Modular monolith, developed in committed phases: frontend first, then FastAPI
backend, PostgreSQL, AI provider abstraction, asynchronous job system, and
media pipeline. No fake implementations ahead of their phase — the dashboard's
project data is typed seed data shaped to mirror the future API.