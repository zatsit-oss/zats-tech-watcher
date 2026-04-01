# Memory Bank — Zatsit Tech Watch Portal

## Projet
- Portail de veille technologique interne Zatsit
- Stack: **Astro 5.x** + TypeScript strict + Tailwind CSS v4 (vanilla TS, pas de framework UI)
- Data: 132 entries depuis `public/tech-watch-v1.tsv`, parsé au build time
- Design: glassmorphism, dot-grid, Poppins (self-hosted @fontsource), bleu (#0f15fd) light / or (#f1be51) dark
- Tests: Vitest (unit) + Playwright (E2E)

## Historique d'implémentation

### V1 — Vite vanilla (phases 0-9)
Implémentation initiale en Vite + TypeScript vanilla avec :
- Router hash custom (`core/router.ts`)
- Store réactif (`core/store.ts` avec subscribe/setState)
- Event bus (`core/events.ts`)
- Tous les composants rendant du HTML en string
- Fetch TSV au runtime dans le navigateur

### V2 — Migration Astro (actuel)
Migration complète vers Astro SSG pour harmoniser avec les autres projets Zatsit :

**Décision** : migration motivée par l'alignement avec greenscore, corporate, cv-generator (tous en Astro).

**Ce qui a changé** :
- `index.html` + `vite.config.ts` → `astro.config.mjs` + `Layout.astro`
- Hash router → file-based routing Astro (7 routes → 7 pages `.astro`)
- Runtime fetch TSV → build-time parsing via `node:fs` (`load-entries.ts`)
- Store réactif → props Astro (statique) + `<script>` vanilla (interactif)
- Google Fonts CDN → `@fontsource/poppins` (éco-conception)
- Ajout composants partagés Zatsit : Header.astro, Footer.astro (social links), ThemeToggle.astro, Logo.astro
- Ajout skip link, FOUC prevention, aria-current, prefers-reduced-motion
- `[name].astro` avec `getStaticPaths()` pour les profils contributeurs

**Ce qui est resté** :
- Tous les charts SVG (bar, line, donut, heatmap, tag-cloud) — inchangés
- `data/parser.ts`, `tag-extractor.ts`, `stats.ts` — logique réutilisée
- `utils/` (date, format, debounce, dom) — inchangés
- `types.ts` — inchangé
- `card-item.ts`, `list-item.ts`, `tag-badge.ts`, `surprise-modal.ts` — adaptés (hash links → file links)

**Ce qui a été supprimé** :
- `core/router.ts`, `core/store.ts`, `core/events.ts` — remplacés par Astro
- `main.ts` — plus de bootstrap manuel
- `src/style.css` → `src/styles/global.css` (contenu identique + @fontsource)
- Composants devenus inutiles : `layout.ts`, `header.ts`, `card-grid.ts`, `list-view.ts`, `filters.ts`, `search-bar.ts`, `sort-menu.ts`, `view-toggle.ts`
- Anciennes pages `.ts` — remplacées par `.astro`

## Design System (Tailwind v4 @theme)

| Token CSS | Light | Dark |
|-----------|-------|------|
| `--color-primary` | `#0f15fd` (bleu) | `#f1be51` (or) |
| `--color-secondary` | `#3b82f6` | `#e1601f` (orange) |
| `--color-bg` | `#ffffff` | `#1b1b1d` |
| `--color-content` | `#1c1e21` | `#e3e3e3` |
| `--color-surface` | `rgba(255,255,255,0.6)` | `rgba(27,27,29,0.6)` |
| `--color-edge` | `rgba(15,21,253,0.1)` | `rgba(241,190,81,0.1)` |

- Font: `--font-sans: 'Poppins', system-ui, -apple-system, sans-serif`
- Shadows: `--shadow-glass`, `--shadow-glass-hover`

## Conventions
- Code & comments: English
- Documentation: French
- Vanilla TS — no UI framework (Astro `<script>` tags for interactivity)
- Éco-conception: self-hosted fonts, static generation, minimal JS
- Skills `.agents/` : tailwind-v4-vite, typescript-5-es2022, html-css-style-color-guide, astro, astro-zatsit-conventions

## Fichiers de référence
- `.claude/architecture.md` — Structure fichiers et data flow
- `.agents/skills/` — Instructions Tailwind v4, TypeScript 5, CSS colors, Astro, conventions Zatsit
- `MIGRATION-ASTRO.md` — Plan de migration détaillé et règles d'harmonisation
