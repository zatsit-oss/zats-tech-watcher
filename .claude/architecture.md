# Architecture Details

## File Structure (36 fichiers source)
```
src/
  main.ts                    # Bootstrap: fetch TSV, init store, mount layout, start router
  style.css                  # @theme Tailwind v4 + dark mode overrides + glassmorphism + dot-grid
  types.ts                   # TypeScript interfaces (TechWatchEntry, AppState, FilterState, etc.)
  core/
    router.ts                # Hash-based router (#/, #/contributors, #/timeline, #/stats, #/tags)
    store.ts                 # Reactive store (getState, setState, subscribe, applyFilters)
    events.ts                # Event bus pub/sub (on, emit)
  data/
    parser.ts                # Fetch + parse TSV → TechWatchEntry[] (sorted by date desc)
    tag-extractor.ts         # Tag extraction from Sujets (alias dict ~50 terms + stopwords FR/EN)
    stats.ts                 # Stats: computeStats, computeTagStats, computeContributorProfiles, computeMonthStats
  components/
    layout.ts                # Shell: header sticky glass + main (ARIA) + footer
    header.ts                # Logo gradient, nav 5 items, theme toggle (localStorage), mobile menu
    card-grid.ts             # Grid layout 1/2/3 cols responsive + empty state
    card-item.ts             # Card glassmorphism: date, subject, tags, contributor, link
    list-view.ts             # List wrapper with dividers + empty state
    list-item.ts             # List row HN-style: index, subject, domain, date, contributor, tags
    view-toggle.ts           # Grid/list toggle buttons
    filters.ts               # Tag filter bar + contributor select + clear button
    search-bar.ts            # Search input with icon, debounced
    sort-menu.ts             # Sort dropdown (recent, oldest, A-Z, contributor, tags)
    surprise-modal.ts        # "Surprise me" modal showing random entry with open/refresh
    tag-badge.ts             # Reusable badge (active/inactive, clickable/static)
  pages/
    home.ts                  # Main: filters + search + view toggle + cards/list + reactive re-render
    contributors.ts          # Leaderboard: podium top 3 (medals) + full table
    contributor-detail.ts    # Profile: avatar, stats, top tags, entries grid
    timeline.ts              # Vertical timeline: toggle month/week, dot markers
    stats-dashboard.ts       # Dashboard: 4 summary cards + 4 SVG charts
    tag-cloud.ts             # Tag cloud + trending + distribution chart + full table
    activity.ts              # Activity page: heatmap, streak stats, top active days
  charts/
    bar-chart.ts             # SVG bars with animations, y-axis labels, grid lines
    line-chart.ts            # SVG line + area gradient fill, dots, value labels
    donut-chart.ts           # SVG donut with inner radius, hover titles, color legend
    heatmap-svg.ts           # SVG GitHub-style activity heatmap (52 weeks, intensity levels)
    tag-cloud-svg.ts         # SVG spiral placement, size by count, color by trend
  utils/
    date.ts                  # parseFrenchDate (DD/MM/YYYY), formatDate, monthKey/Label, weekKey, groupByDate
    dom.ts                   # qs, qsa, mount, unmount, el
    debounce.ts              # Simple debounce (no args)
    format.ts                # truncate, formatNumber, extractDomain, capitalize
```

## Data Flow
1. `main.ts` fetches `public/tech-watch-v1.tsv` via `data/parser.ts`
2. Parser splits TSV lines, extracts 4 columns (Date, Rapporteurs, Sujets, Liens)
3. Tags extracted from "Sujets" via `data/tag-extractor.ts` (alias dictionary, stopwords, fallback "Other")
4. Domain extracted from URL via `utils/format.ts`
5. Entries stored in `core/store.ts` → triggers initial render
6. `core/router.ts` handles hash navigation, mounts appropriate page component
7. Pages subscribe to store for reactive re-renders on state changes
8. Filters (tags, contributor, search, date) → `applyFilters()` → filtered entries → re-render

## Routes
| Hash | Page | Description |
|------|------|-------------|
| `#/` | home.ts | Grille/liste filtrable |
| `#/contributors` | contributors.ts | Leaderboard |
| `#/contributors/:name` | contributor-detail.ts | Profil contributeur |
| `#/timeline` | timeline.ts | Frise chronologique |
| `#/stats` | stats-dashboard.ts | Dashboard 4 charts SVG |
| `#/tags` | tag-cloud.ts | Nuage de tags + tendances |
| `#/activity` | activity.ts | Heatmap d'activité + stats |

## Tag Extraction Strategy
- La colonne "Tags" du TSV est vide → tags extraits automatiquement de "Sujets"
- Dictionnaire d'alias (~50 termes) : `ia` → `AI`, `oss` → `Open Source`, `k8s` → `DevOps`, etc.
- Multi-word aliases checked first, then single words
- Stopwords FR/EN filtrés
- Fallback: tag "Other" si aucun match
- Tags résultants: AI, Security, DevOps, Open Source, Web, Green IT, API, Git, Testing, Data, Tools, Cloud, Documentation, Languages, Collaboration, Training

## Build Output
- CSS: ~22KB (gzip 5KB)
- JS: ~42KB (gzip 12KB)
- Total gzip: ~17KB — bien sous l'objectif de 100KB
