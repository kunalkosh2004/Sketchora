# Sketchora — Frontend

The Sketchora frontend: a premium, editorial UI for turning hand-drawn fashion
sketches into realistic AI visualizations.

**Current state:** landing page, design system, dashboard, and studio workspace
(complete). Backend and AI pipeline come next.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- Motion (Framer Motion) for subtle, reduced-motion-aware animation
- Lucide icons
- Custom SVG artwork (no external image assets)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint       # ESLint
npm run build      # type-check + production build
```

## Design system

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens, typography, dark mode,
component architecture, and the testing approach. All future screens must
consume these tokens and primitives (`src/components/ui/`).

## Structure

```
src/
├── app/            routes (/, /dashboard, /studio, /studio/[id]) · globals.css
├── components/
│   ├── ui/         primitives — Button, Logo, Reveal, Tip, CommandMenu, ThemeToggle
│   ├── artwork/    SketchIllustration, VisualizationIllustration (SVG)
│   ├── landing/    landing page sections
│   ├── dashboard/  project grid, new-design flow, mobile nav
│   └── studio/     workspace shell, canvas, inspectors
└── lib/            projects + studio data models, utils
```