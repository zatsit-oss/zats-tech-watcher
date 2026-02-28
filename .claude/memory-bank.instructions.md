# Memory Bank — Zatsit Tech Watch Portal

## Projet
- Portail de veille technologique interne Zatsit
- Stack: Vite 7.x + TypeScript 5.9 + Tailwind CSS v4 (vanilla, pas de framework)
- Data: 132 entries depuis `public/tech-watch-v1.tsv`
- Design: glassmorphism, dot-grid, Poppins, bleu (#0f15fd) light / or (#f1be51) dark

## Plan d'implémentation réalisé

### Phase 0 — Setup infrastructure
- Installé `tailwindcss` + `@tailwindcss/vite`
- Créé `vite.config.ts` avec plugin Tailwind
- Réécrit `index.html` (Poppins via Google Fonts, `data-theme`, meta)
- Réécrit `src/style.css` avec `@theme` Tailwind v4 + CSS vars dark mode + glassmorphism + dot-grid
- Supprimé `counter.ts`, `typescript.svg` (boilerplate Vite)

### Phase 1 — Core (fondations)
- `types.ts` — Interfaces TS (`TechWatchEntry`, `ContributorProfile`, `DashboardStats`, `FilterState`, `AppState`)
- `core/store.ts` — Store réactif minimal (getState, setState, subscribe, applyFilters)
- `core/events.ts` — Event bus typé (on, emit)
- `core/router.ts` — Router hash avec extraction de paramètres (`:name`)
- `utils/` — date (parse DD/MM/YYYY, groupement semaine/mois), dom (qs, qsa, mount), debounce, format (truncate, extractDomain)

### Phase 2 — Data
- `data/parser.ts` — Fetch TSV, parse, extraction domaine depuis URL
- `data/tag-extractor.ts` — Extraction tags depuis colonne "Sujets" (alias dictionary ~50 termes, stopwords FR/EN, fallback "Other")
- `data/stats.ts` — Calculs agrégés (par tag, contributeur, mois, tendances)

### Phase 3 — Layout + Theme
- `components/layout.ts` — Shell app (header sticky glass, main, footer avec ARIA)
- `components/header.ts` — Logo gradient, navigation, theme toggle (localStorage), menu mobile responsive

### Phase 4 — Page principale (Home)
- `components/tag-badge.ts` — Badge tag réutilisable (actif/inactif, cliquable/statique)
- `components/card-item.ts` + `card-grid.ts` — Vue grille glassmorphism 3 colonnes
- `components/list-item.ts` + `list-view.ts` — Vue liste compacte HN-style
- `components/view-toggle.ts` — Toggle grille/liste
- `components/filters.ts` — Filtres multi-tags + select contributeur + bouton clear
- `components/search-bar.ts` — Recherche texte avec icône
- `pages/home.ts` — Assemblage complet avec re-render réactif, skeleton loading, error state

### Phase 5 — Contributeurs
- `pages/contributors.ts` — Leaderboard avec podium top 3 (médailles) + table complète
- `pages/contributor-detail.ts` — Profil avec avatar, stats, top tags, liste des contributions

### Phase 6 — Timeline
- `pages/timeline.ts` — Frise chronologique verticale, toggle mois/semaine, dot-timeline

### Phase 7 — Dashboard Stats
- `charts/bar-chart.ts` — Barres SVG avec animations
- `charts/line-chart.ts` — Lignes SVG avec aire dégradée
- `charts/donut-chart.ts` — Donut SVG avec légende
- `pages/stats-dashboard.ts` — 4 summary cards + 4 charts (évolution mensuelle, répartition tags, top tags, top contributeurs)

### Phase 8 — Tag Cloud
- `charts/tag-cloud-svg.ts` — Nuage SVG interactif (placement spirale, taille proportionnelle)
- `pages/tag-cloud.ts` — Cloud + tendances montantes + distribution + table complète

### Phase 8b — Activité
- `charts/heatmap-svg.ts` — Heatmap SVG style GitHub (52 semaines, niveaux d'intensité via color-mix)
- `pages/activity.ts` — Page activité : calendrier heatmap, streak max, jours les plus actifs, moyenne/semaine

### Phase 8c — UX améliorations
- `components/sort-menu.ts` — Menu déroulant tri (récent, ancien, A-Z, contributeur, nb tags)
- `components/surprise-modal.ts` — Modale "Surprise" affichant une entrée aléatoire avec boutons ouvrir/relancer

### Phase 9 — Polish
- Transitions entre routes (fadeIn animation)
- States: skeleton loading, empty state, error state avec bouton retry
- Accessibilité (ARIA roles sur main/footer, aria-label sur boutons)

## Design System (Tailwind v4 @theme)

| Token CSS | Light | Dark |
|-----------|-------|------|
| `--color-primary` | `#0f15fd` (bleu) | `#f1be51` (or) |
| `--color-secondary` | `#3b82f6` | `#e1601f` (orange) |
| `--color-bg` | `#ffffff` | `#1b1b1d` |
| `--color-content` | `#1c1e21` | `#e3e3e3` |
| `--color-surface` | `rgba(255,255,255,0.6)` | `rgba(27,27,29,0.6)` |
| `--color-edge` | `rgba(15,21,253,0.1)` | `rgba(241,190,81,0.1)` |

- Font: `--font-sans: 'Poppins', sans-serif`
- Shadows: `--shadow-glass`, `--shadow-glass-hover`
- Utilities Tailwind: `text-primary`, `text-content`, `bg-bg-alt`, `border-edge`, etc.

## Conventions
- Code & comments: English
- Documentation: French
- Pas de framework, vanilla TS
- Éco-conception: bundle < 100KB (CSS 22KB + JS 42KB gzip ~17KB)
- Route `#/activity` ajoutée dans `main.ts` pour la page activité
- `SortOption` type ajouté dans `types.ts` (recent, oldest, alpha, contributor, tags)
- Skills `.agents/` respectées: tailwind-v4-vite, typescript-5-es2022, html-css-style-color-guide

## Fichiers de référence
- `.claude/architecture.md` — Structure fichiers et data flow
- `.agents/skills/` — Instructions Tailwind v4, TypeScript 5, CSS colors
- `Agents.md` — Rôle et contexte du projet
