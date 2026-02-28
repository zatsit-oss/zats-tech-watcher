# CLAUDE.md — zats-ai-101-tech-watch-portal

## Project Overview
Internal tech watch portal for the Zatsit team, built with Vite + TypeScript + Tailwind CSS v4 (vanilla, no framework).

## Technology Stack
- Vite 7.x
- TypeScript 5.9.x (strict, ES2022 target)
- Tailwind CSS v4 with `@tailwindcss/vite` plugin (CSS-first config via `@theme`)
- Vanilla TS — no UI framework (no React, no Vue)

## Code Conventions
- Code and comments: **always in English**
- User-facing documentation: **in French**
- Variable and function names: explicit, in English
- File names: kebab-case (e.g., `tag-badge.ts`)
- Follow existing code patterns — extend, don't reinvent

## Available Scripts
- `npm run dev` — Start dev server
- `npm run build` — Build for production (`tsc && vite build`)
- `npm run preview` — Preview production build

## Project Structure
```
src/
  main.ts              # Bootstrap: fetch TSV, init store, register routes, start router
  style.css            # @theme Tailwind v4 + dark mode CSS vars + glassmorphism + dot-grid
  types.ts             # Shared TypeScript interfaces and types
  core/                # Router, reactive store, event bus
  data/                # TSV parser, tag extractor, stats computation
  components/          # Reusable UI components (layout, header, cards, filters, etc.)
  pages/               # Route-level pages (home, contributors, timeline, stats, tags, activity)
  charts/              # SVG chart components (bar, line, donut, tag-cloud, heatmap)
  utils/               # Helpers (date, dom, debounce, format)
public/
  tech-watch-v1.tsv    # Data source (132 entries)
```

## Design System (Tailwind v4 @theme)
| Token CSS | Light | Dark |
|-----------|-------|------|
| `--color-primary` | `#0f15fd` (blue) | `#f1be51` (gold) |
| `--color-secondary` | `#3b82f6` | `#e1601f` (orange) |
| `--color-bg` | `#ffffff` | `#1b1b1d` |
| `--color-content` | `#1c1e21` | `#e3e3e3` |
| `--color-surface` | `rgba(255,255,255,0.6)` | `rgba(27,27,29,0.6)` |

- Font: Poppins (`--font-sans`)
- Style: glassmorphism cards, dot-grid background

## Routes
| Hash | Page | Description |
|------|------|-------------|
| `#/` | home | Filterable grid/list view |
| `#/contributors` | contributors | Leaderboard with podium |
| `#/contributors/:name` | contributor-detail | Contributor profile |
| `#/timeline` | timeline | Vertical timeline |
| `#/stats` | stats-dashboard | 4 SVG charts dashboard |
| `#/tags` | tag-cloud | Tag cloud + trends |
| `#/activity` | activity | Activity heatmap + stats |

## Architecture Details
See `.claude/architecture.md` for full file listing and data flow.

## Skills
Skill instructions in `.agents/skills/`:
- `tailwind-v4-vite.instructions.md` — Tailwind CSS v4 with Vite plugin
- `typescript-5-es2022.instructions.md` — TypeScript 5.x / ES2022 guidelines
- `html-css-style-color-guide.instructions.md` — Color and styling rules
- `accessibility-a11y.instructions.md` — Accessibility guidelines (WCAG, ARIA, semantic HTML)
- `accessibility-audit.instructions.md` — Accessibility audit workflow (Webflow)
