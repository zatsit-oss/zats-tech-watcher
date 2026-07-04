# CLAUDE.md — zats-ai-101-tech-watch-portal

## Project Overview
Internal tech watch portal for the Zatsit team, built with Astro + TypeScript + Tailwind CSS v4.
Aligned with the Zatsit project ecosystem (greenscore, corporate, cv-generator).

## Technology Stack
- Astro 5.x (SSG, file-based routing)
- TypeScript strict (`extends: "astro/tsconfigs/strict"`)
- Tailwind CSS v4 with `@tailwindcss/vite` plugin (CSS-first config via `@theme`)
- Vanilla TS — no UI framework (no React, no Vue)
- Poppins font self-hosted via `@fontsource/poppins`
- Vitest (unit tests) + Playwright (E2E tests)

## Code Conventions
- Code and comments: **always in English**
- User-facing documentation: **in French**
- Variable and function names: explicit, in English
- File names: kebab-case (e.g., `tag-badge.ts`), components PascalCase (e.g., `Header.astro`)
- Follow existing code patterns — extend, don't reinvent

## Available Scripts
- `npm run dev` — Start Astro dev server
- `npm run build` — Type check + build (`astro check && astro build`)
- `npm run preview` — Preview production build
- `npm run test` — Run unit tests (Vitest)
- `npm run test:e2e` — Build + run E2E tests (Playwright)
- `npm run test:watch` — Run unit tests in watch mode
- `npm run deploy:cellar` — Build + deploy to Clever Cloud Cellar (prod, also run by CI on main)

## Project Structure
```
src/
  layouts/
    Layout.astro         # HTML shell: head, FOUC prevention, skip link, Header, main, Footer
  components/
    Header.astro         # Sticky glass nav, logo, nav links, theme toggle, mobile menu
    Footer.astro         # Social links (blog, LinkedIn, GitHub), copyright
    Logo.astro           # Zatsit SVG sigle
    ThemeToggle.astro    # Dark/light toggle with localStorage persistence
    card-item.ts         # Card HTML string (glassmorphism)
    list-item.ts         # List row HTML string
    tag-badge.ts         # Tag badge HTML string (active/inactive, clickable/static)
    surprise-modal.ts    # "Surprise me" modal HTML string
  pages/
    index.astro          # Home: filterable grid/list (client-side search/sort/filter)
    contributors/
      index.astro        # Leaderboard with podium
      [name].astro       # Contributor profile (getStaticPaths)
    timeline.astro       # Vertical timeline (month/week toggle)
    stats.astro          # Dashboard with 4 SVG charts
    tags.astro           # Tag cloud + trends + distribution
    activity.astro       # Activity heatmap + streak stats
  data/
    load-entries.ts      # Build-time data loader (node:fs)
    parser.ts            # TSV parser → TechWatchEntry[]
    tag-extractor.ts     # Tag extraction (alias dict ~50 terms)
    stats.ts             # Stats computation (by tag, contributor, month)
  charts/                # SVG chart components (bar, line, donut, tag-cloud, heatmap)
  styles/
    global.css           # @theme Tailwind v4 + dark mode + glassmorphism + dot-grid
  types.ts               # Shared TypeScript interfaces
  utils/                 # Helpers (date, dom, debounce, format)
tests/                   # Unit tests (Vitest)
e2e/                     # E2E tests (Playwright)
public/
  tech-watch-v1.tsv      # Data source (synced from Google Sheet via scripts/sync-tech-watch-data.mjs)
  zatsit.svg             # Favicon
scripts/
  sync-tech-watch-data.mjs  # Download Google Sheet + normalize into the TSV (used by sync-data.yml)
```

## Design System (Tailwind v4 @theme)
| Token CSS | Light | Dark |
|-----------|-------|------|
| `--color-primary` | `#0f15fd` (blue) | `#f1be51` (gold) |
| `--color-secondary` | `#3b82f6` | `#e1601f` (orange) |
| `--color-bg` | `#ffffff` | `#1b1b1d` |
| `--color-content` | `#1c1e21` | `#e3e3e3` |
| `--color-surface` | `rgba(255,255,255,0.6)` | `rgba(27,27,29,0.6)` |

- Font: Poppins self-hosted (`--font-sans`)
- Style: glassmorphism cards, dot-grid background

## Routes (file-based)
| Path | Page | Description |
|------|------|-------------|
| `/` | index.astro | Filterable grid/list view |
| `/contributors/` | contributors/index.astro | Leaderboard with podium |
| `/contributors/:name/` | contributors/[name].astro | Contributor profile |
| `/timeline/` | timeline.astro | Vertical timeline |
| `/stats/` | stats.astro | 4 SVG charts dashboard |
| `/tags/` | tags.astro | Tag cloud + trends |
| `/activity/` | activity.astro | Activity heatmap + stats |

## Architecture Details
See `.claude/architecture.md` for full file listing and data flow.

## Skills
Skill instructions in `.agents/skills/`:
- `astro-zatsit-conventions.instructions.md` — Zatsit Astro conventions (shared patterns)
- `astro/SKILL.md` — Astro framework usage guide
- `tailwind-v4-vite.instructions.md` — Tailwind CSS v4 with Vite plugin
- `typescript-5-es2022.instructions.md` — TypeScript 5.x / ES2022 guidelines
- `html-css-style-color-guide.instructions.md` — Color and styling rules
- `accessibility-a11y/SKILL.md` — Accessibility guidelines (WCAG, ARIA, semantic HTML)
- `accessibility-audit/SKILL.md` — Accessibility audit workflow
