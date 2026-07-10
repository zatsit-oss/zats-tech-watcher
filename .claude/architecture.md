# Architecture Details

## Framework
**Astro 5.x** — Static Site Generation (SSG) with file-based routing.
All pages are pre-rendered at build time. Client-side interactivity via `<script>` tags (vanilla TS, no UI framework).

## File Structure
```
src/
  layouts/
    Layout.astro               # HTML shell: head, skip link, Header, main#main-content, Footer
  components/
    Header.astro               # Sticky glass nav, logo, nav links, theme toggle, mobile menu
    Footer.astro               # Social links (blog, LinkedIn, GitHub), copyright
    Logo.astro                 # Zatsit SVG sigle (currentColor)
    ThemeToggle.astro          # Dark/light toggle with sun/moon icons, localStorage
    card-item.ts               # Card glassmorphism: date, subject, tags, contributor, link
    list-item.ts               # List row: index, subject, domain, date, contributor, tags
    tag-badge.ts               # Reusable badge (active/inactive, clickable/static)
    contributor-name.ts        # Contributor link/span helper (gated by showRanking, escaped)
  pages/
    index.astro                # Home: filterable grid/list with client-side search/sort/filter
    404.astro                  # Not-found page (served by static hosting)
    mentions-legales.astro     # Legal notice page
    contributors/
      index.astro              # Leaderboard: podium top 3 + full table
      [name].astro             # Contributor profile (getStaticPaths from TSV data)
    timeline.astro             # Vertical timeline: toggle month/week, dot markers
    stats.astro                # Dashboard: 4 summary cards + 4 SVG charts
    tags.astro                 # Tag cloud + trending + distribution chart + full table
    activity.astro             # Activity heatmap, streak stats, top active days
  config.ts                    # Site-wide feature flags (anonymizeContributors, showRanking)
  data/
    load-entries.ts            # Build-time data loader (node:fs → parseTsvText)
    parser.ts                  # Parse TSV text → TechWatchEntry[] (sorted by date desc)
    tag-extractor.ts           # Tag extraction from Sujets (alias dict ~120 terms + stopwords FR/EN)
    stats.ts                   # computeStats, computeTagStats, computeContributorProfiles, computeMonthStats
  charts/
    bar-chart.ts               # SVG bars with animations, y-axis labels, grid lines
    line-chart.ts              # SVG line + area gradient fill, dots, value labels
    donut-chart.ts             # SVG donut with inner radius, hover titles, color legend
    heatmap-svg.ts             # SVG GitHub-style activity heatmap (52 weeks, intensity levels)
    tag-cloud-svg.ts           # SVG spiral placement, size by count, color by trend
  styles/
    global.css                 # @theme Tailwind v4 + dark mode overrides + glassmorphism + dot-grid
  types.ts                     # TypeScript interfaces (TechWatchEntry, AppState, FilterState, etc.)
  utils/
    date.ts                    # parseFrenchDate (DD/MM/YYYY), formatDate, monthKey/Label, weekKey, groupByDate
    dom.ts                     # qs, qsa, mount, unmount, el
    debounce.ts                # Simple debounce (no args)
    format.ts                  # escapeHtml, truncate, formatNumber, extractDomain, capitalize
tests/                         # Unit tests (Vitest)
e2e/                           # E2E tests (Playwright)
public/
  zatsit.svg                   # Favicon (Zatsit sigle)
data/
  tech-watch-v1.tsv            # Data source (synced from Google Sheet, NOT shipped: full names)
  zatsit.svg                   # Favicon (Zatsit sigle)
```

## Data Flow
1. At **build time**, `data/load-entries.ts` reads `data/tech-watch-v1.tsv` via `node:fs` (outside public/: never shipped)
2. `data/parser.ts` splits TSV lines, extracts Date, Contributors, Topics, Links and the optional Comment
3. Contributor names are replaced by stable pseudonyms in `load-entries.ts` when `siteConfig.anonymizeContributors` is on (default)
4. Tags extracted from "Topics" via `data/tag-extractor.ts` (alias dictionary, stopwords, fallback "Other")
5. Domain extracted from URL via `utils/format.ts`
6. Each `.astro` page imports `loadEntries()` in its frontmatter → data available at build
7. Astro renders all pages to static HTML (8 pages by default; ~21 including contributor profiles when the ranking is enabled)
8. Client-side `<script>` blocks handle interactivity (filters, search, sort, view toggle, theme)

## Routes (file-based)
| Path | Page | Description |
|------|------|-------------|
| `/` | index.astro | Grille/liste filtrable (client-side filtering) |
| `/contributors/` | contributors/index.astro | Leaderboard |
| `/contributors/:name/` | contributors/[name].astro | Profil contributeur (getStaticPaths) |
| `/timeline/` | timeline.astro | Frise chronologique |
| `/stats/` | stats.astro | Dashboard 4 charts SVG |
| `/tags/` | tags.astro | Nuage de tags + tendances |
| `/activity/` | activity.astro | Heatmap d'activité + stats |
| `/404.html` | 404.astro | Page introuvable |
| `/mentions-legales/` | mentions-legales.astro | Mentions légales |

## Feature Flags (`src/config.ts`)
- `siteConfig.anonymizeContributors` (défaut `true`) : les noms de contributeurs sont remplacés au build par des pseudonymes stables ("Contributeur 1..N") dans `load-entries.ts`, et `showRanking` est forcé à `false`. La source TSV (noms complets) vit dans `data/`, jamais déployée. Les mentions légales s'adaptent automatiquement au flag.
- `siteConfig.showRanking` — quand `false` : lien nav "Contributeurs" masqué, `/contributors/` redirige vers l'accueil (stub meta-refresh en SSG), pages profils non générées, noms de contributeurs rendus en texte simple (via `components/contributor-name.ts`), chart "Top Contributeurs" masqué sur `/stats/`, tests E2E contributeurs skippés.

## Tag Extraction Strategy
- La colonne "Tags" du TSV est vide → tags extraits automatiquement de "Sujets"
- Dictionnaire d'alias (~120 termes) : `ia` → `AI`, `oss` → `Open Source`, `k8s` → `DevOps`, etc.
- Multi-word aliases checked first, then single words
- Stopwords FR/EN filtrés
- Fallback: tag "Other" si aucun match
- Tags résultants: AI, Security, DevOps, Open Source, Web, Green IT, API, Git, Testing, Data, Tools, Cloud, Documentation, Languages, Collaboration, Training, Craft, Events

## Testing
- **Unit tests**: Vitest — `npm run test` (parser, tag-extractor, stats, date, format)
- **E2E tests**: Playwright + Chromium — `npm run test:e2e` (navigation, filters, dark mode, a11y)

## Build Output
- 8 static HTML pages by default (anonymized, no contributor pages); ~21 when the ranking is enabled
- CSS + JS: minimal client-side bundle (filters/theme/mobile menu only)
- Font: self-hosted Poppins via @fontsource (no external CDN)
