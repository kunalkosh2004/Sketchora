# Sketchora — Design System

The Sketchora frontend lives in `frontend/`. This document describes the design
system that all future screens (dashboard, studio, editor) must use. The
landing page is the reference implementation.

## Principles

- **The user's design is the hero.** UI disappears behind the artwork.
- **Premium simplicity.** Every element earns its place; restraint over ornament.
- Warm, editorial, tactile — Apple × Vogue × Figma, not a generic AI dashboard.
- Light mode is default; dark mode is a "fashion studio at night".

## Tokens

All tokens are centralized in `src/app/globals.css` using Tailwind v4 `@theme`.
Never scatter raw values in components.

### Color

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `paper` | `#faf7f2` (warm off-white) | `#16130e` | page background |
| `surface` | `#fffdfa` | `#1f1b14` | raised surfaces |
| `ink` | `#1c1915` (soft black) | `#ece7dd` | primary text, primary buttons |
| `ink-soft` | `#524b42` | `#b3ab9d` | secondary text |
| `muted` | `#8b8377` | `#8a8274` | tertiary text, captions |
| `line` | `#e8e2d7` | `#2b2620` | hairline borders |
| `line-strong` | `#d9d2c4` | `#3a342b` | stronger borders |
| `accent` | `#7d3328` (oxblood) | `#c0634f` | **sparingly** — eyebrows, links, small details |
| `accent-deep` / `accent-soft` | `#64261d` / `#f4e9e3` | `#d17a66` / `#33221d` | hover / tints |

Rules: no gradients-as-decoration, no neon, no purple "AI glow". `accent` is
never used as a page wash.

### Typography

- **UI — Geist** (`--font-sans`): interface, body, buttons.
- **Display — Instrument Serif** (`--font-display`): hero headlines, section
  headers, editorial moments. Mixed case; italic sparingly for emphasis.
- **Mono — Geist Mono** (`--font-mono`): eyebrows, captions, labels, numbers.

Editorial eyebrows use the `.eyebrow` utility: 11px mono, 0.22em tracking,
uppercase.

### Radius (Apple-like, not pill-everything)

| Token | Value |
| --- | --- |
| `sm` | 10px (small controls) |
| `md` | 12px |
| `lg` | 16px (cards, buttons large) |
| `xl` / `2xl` | 20px / 24px |
| `3xl` / `4xl` | 28px / 32px (hero media, large containers) |

### Shadows (materials floating, never blurry)

- `shadow-soft` — resting surfaces
- `shadow-lift` — hover / hero media
- `shadow-overlay` — modals / overlays

### Motion

- `ease-out-soft` = `cubic-bezier(0.22, 1, 0.36, 1)` — the default curve.
- Durations: micro 100–150ms, UI 200–300ms, panels 300–400ms.
- Respect `prefers-reduced-motion` (global CSS override + `useReducedMotion`
  in JS animations).

### Spacing

The Tailwind default scale (8/12/16/24/32/48/64/96/128) is used as-is.
Sections breathe: `py-24 md:py-32`, generous gaps.

## Dark mode

Class strategy: `.dark` on `<html>`. `layout.tsx` injects a
`beforeInteractive` script that reads `localStorage["sketchora-theme"]` and
falls back to `prefers-color-scheme`. `ThemeToggle` persists the choice.

## Component architecture

```
src/components/
├── ui/        Button, Logo, Reveal, ThemeToggle — design-system primitives
├── artwork/   SketchIllustration, VisualizationIllustration (SVG, no assets)
├── landing/   Nav, Hero, CompareSlider, HowItWorks, Features, Workflow, Cta, Footer
├── dashboard/ Nav, ProjectsGrid, ProjectCard, NewDesignDialog, ProfileSheet,
               BottomNav, DashboardShell
└── studio/    StudioShell, StudioTopbar, StageRail, StudioCanvas, Inspector,
               ProgressOverlay, Toast
```

All screens consume `ui/` primitives (`Button`, `CommandMenu`, `Tip`,
`Reveal`, `ThemeToggle`). No page is a giant component.

## Data

The dashboard and studio consume a typed project model in `src/lib/projects.ts`
(statuses: sketched / generating / completed / failed) and a workspace model in
`src/lib/studio.ts` (stages, spec options, versions, variations). The current
source is seed data shaped to mirror the future API — swap the source in
`DashboardShell` / `StudioShell` when the backend lands. Demo states:
`/dashboard?state=empty` and `/dashboard?state=loading`. Analysis, generation,
and animation run as timed UI state demos in `StudioShell` until the backend
phases land — each is marked in code.

## Artwork

The hero visual is pure SVG (`artwork/`): a hand-drawn pencil sketch and a
satin-rendered visualization sharing one silhouette so the comparison slider
aligns. No external image assets — nothing to license, load, or break.
`VisualizationIllustration` accepts `dressHue` for variation thumbnails.

## Accessibility

- Keyboard-operable controls (the compare slider is a real `<input type="range">`).
- Visible `:focus-visible` rings, ARIA labels on icon-only controls.
- Semantic HTML, `alt`/`aria-label` on artwork.
- Reduced-motion support.

## Testing

- `npm run lint` (ESLint, react-hooks rules)
- `npm run build` (type-check + production build)
- Responsive verification: Playwright against system Chrome at 1440 / 768 /
  390 / 320 px — horizontal-overflow checks and interaction tests for every
  screen (compare slider, search, ⌘K, new-design flow, studio analysis/
  generation/variations/animate flows, dark mode). Screenshots land in
  `frontend/screenshots/` (gitignored).