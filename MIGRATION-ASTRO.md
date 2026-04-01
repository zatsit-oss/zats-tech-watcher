# Plan de migration — Vite vanilla → Astro

## Contexte

Migration du portail de veille technologique de Vite + TypeScript vanilla vers Astro, afin d'harmoniser la stack avec les autres projets Zatsit :
- **zats-greenscore** : Astro 5.16 + Tailwind v4 + @tailwindcss/vite
- **zats-websites/corporate** : Astro 5.16 + Tailwind v4 + @tailwindcss/vite + ViewTransitions
- **zats-cv-generator** : Astro 5.1 + Tailwind v3 (à moderniser aussi)

## Stack cible

| Outil | Version | Notes |
|-------|---------|-------|
| Astro | 5.x | SSG, file-based routing |
| Tailwind CSS | v4 | via `@tailwindcss/vite` (déjà en place) |
| TypeScript | strict | `extends: "astro/tsconfigs/strict"` |
| Font | Poppins | via `@fontsource/poppins` (self-hosted, éco-conception) |
| Déploiement | Clever Cloud | static hosting (inchangé) |

---

## Phase 1 — Initialisation du projet Astro

### 1.1 Dépendances

```bash
npm install astro @tailwindcss/vite
npm install @fontsource/poppins
npm uninstall vite  # Astro embarque Vite
```

### 1.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tech-watch.zatsit.fr',
  compressHTML: true,
  prefetch: { defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()]
  }
});
```

> Pattern aligné sur **greenscore** et **corporate**.

### 1.3 `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

### 1.4 Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
```

---

## Phase 2 — Structure de fichiers

### Arborescence cible

```
src/
├── components/
│   ├── Header.astro            ← nouveau (pattern corporate/greenscore)
│   ├── Footer.astro            ← nouveau (pattern corporate/greenscore)
│   ├── Logo.astro              ← sigle Zatsit SVG
│   ├── ThemeToggle.astro       ← pattern greenscore
│   ├── EntryCard.astro         ← depuis components/entry-card.ts
│   ├── TagBadge.astro          ← depuis components/tag-badge.ts
│   ├── FilterBar.astro         ← island (client:load)
│   ├── SearchInput.astro       ← island (client:load)
│   └── charts/                 ← SVG charts (inchangés, wrappés en .astro)
│       ├── BarChart.astro
│       ├── LineChart.astro
│       ├── DonutChart.astro
│       ├── TagCloud.astro
│       └── Heatmap.astro
├── layouts/
│   └── Layout.astro            ← shell HTML + Header + Footer
├── pages/
│   ├── index.astro             ← home (grille filtrable)
│   ├── contributors/
│   │   ├── index.astro         ← leaderboard
│   │   └── [name].astro        ← profil contributeur (getStaticPaths)
│   ├── timeline.astro
│   ├── stats.astro
│   ├── tags.astro
│   └── activity.astro
├── data/
│   ├── tsv-parser.ts           ← réutilisé tel quel
│   ├── tag-extractor.ts        ← réutilisé tel quel
│   └── stats.ts                ← réutilisé tel quel
├── types/
│   └── index.ts                ← réutilisé (types.ts actuel)
├── utils/
│   ├── date.ts                 ← réutilisé
│   ├── format.ts               ← réutilisé
│   └── dom.ts                  ← conservé pour les islands
└── styles/
    └── global.css              ← @theme Tailwind v4 (style.css actuel)
public/
├── tech-watch-v1.tsv           ← données
└── zatsit.svg                  ← favicon
```

### Ce qui disparaît

| Fichier actuel | Raison |
|----------------|--------|
| `src/core/router.ts` | Remplacé par le routing fichier Astro |
| `src/core/store.ts` | Remplacé par des props Astro + islands pour l'interactivité |
| `src/core/event-bus.ts` | Plus nécessaire (MPA) |
| `src/main.ts` | Plus de bootstrap manuel |
| `vite.config.ts` | Remplacé par `astro.config.mjs` |
| `index.html` | Remplacé par `Layout.astro` |

---

## Phase 3 — Composants partagés (harmonisation Zatsit)

### 3.1 Layout.astro

Pattern commun à **tous** les projets Zatsit :

```astro
---
import "../styles/global.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Portail de veille technologique Zatsit" } = Astro.props;
---

<!doctype html>
<html lang="fr" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content="fr_FR" />
  <link rel="icon" type="image/svg+xml" href="/zatsit.svg" />
  <title>{title}</title>

  <!-- FOUC prevention (pattern greenscore + corporate) -->
  <script is:inline>
    (function() {
      const theme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
</head>
<body class="min-h-screen flex flex-col bg-bg text-content font-sans transition-colors duration-300">
  <!-- Skip link (a11y — pattern greenscore + corporate) -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-white">
    Aller au contenu principal
  </a>

  <Header />

  <main id="main-content" class="flex-1 container mx-auto px-4">
    <slot />
  </main>

  <Footer />
</body>
</html>
```

### 3.2 Header.astro

Pattern harmonisé depuis **corporate** et **greenscore** :

```astro
---
import Logo from "./Logo.astro";
import ThemeToggle from "./ThemeToggle.astro";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/contributors", label: "Contributeurs" },
  { href: "/timeline", label: "Timeline" },
  { href: "/stats", label: "Stats" },
  { href: "/tags", label: "Tags" },
  { href: "/activity", label: "Activité" },
];

const currentPath = Astro.url.pathname;
---

<header class="glass sticky top-0 z-50 py-4 mb-8">
  <nav class="container mx-auto px-4 flex justify-between items-center" aria-label="Navigation principale">
    <a href="/" aria-label="Zatsit Tech Watch - Accueil" class="flex items-center gap-2">
      <Logo class="h-8 w-auto" />
      <span class="text-gradient font-bold text-xl hidden sm:inline">Tech Watch</span>
    </a>

    <!-- Desktop nav -->
    <div class="hidden lg:flex items-center gap-6">
      {navLinks.map(link => (
        <a
          href={link.href}
          class:list={["nav-link text-sm font-medium hover:text-primary transition-colors", { "text-primary font-semibold": currentPath === link.href }]}
          aria-current={currentPath === link.href ? "page" : undefined}
        >
          {link.label}
        </a>
      ))}
    </div>

    <div class="flex items-center gap-3">
      <ThemeToggle />
      <!-- Mobile menu button -->
      <button id="mobile-menu-btn" class="lg:hidden p-2" aria-expanded="false" aria-label="Ouvrir le menu" aria-controls="mobile-menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden lg:hidden" role="navigation" aria-label="Menu mobile">
    <div class="container mx-auto px-4 py-4 flex flex-col gap-3">
      {navLinks.map(link => (
        <a href={link.href} class="nav-link py-2 text-sm font-medium"
           aria-current={currentPath === link.href ? "page" : undefined}>
          {link.label}
        </a>
      ))}
    </div>
  </div>
</header>

<script>
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn?.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu?.classList.toggle('hidden');
  });
</script>
```

### 3.3 Footer.astro

Pattern harmonisé depuis **corporate** et **greenscore** :

```astro
---
const year = new Date().getFullYear();
---

<footer class="mt-16 text-sm text-content opacity-80 border-t border-[var(--color-border)]">
  <div class="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-y-4 sm:gap-x-16 my-8">
    <!-- Social links (pattern corporate + greenscore) -->
    <div class="flex gap-4">
      <a href="https://blog.zatsit.fr/" target="_blank" rel="noopener noreferrer"
         aria-label="Notre blog (ouvre un nouvel onglet)"
         class="flex items-center justify-center h-[34px] w-[34px] rounded-full bg-primary text-white hover:opacity-80 transition-opacity">
        <!-- Blog icon SVG -->
      </a>
      <a href="https://www.linkedin.com/company/zatsit/" target="_blank" rel="noopener noreferrer"
         aria-label="Notre page LinkedIn (ouvre un nouvel onglet)"
         class="flex items-center justify-center h-[34px] w-[34px] rounded-full bg-primary text-white hover:opacity-80 transition-opacity">
        <!-- LinkedIn icon SVG -->
      </a>
      <a href="https://github.com/zatsit-oss" target="_blank" rel="noopener noreferrer"
         aria-label="Notre GitHub (ouvre un nouvel onglet)"
         class="flex items-center justify-center h-[34px] w-[34px] rounded-full bg-primary text-white hover:opacity-80 transition-opacity">
        <!-- GitHub icon SVG -->
      </a>
    </div>
  </div>
  <div class="container mx-auto px-4 flex flex-col items-center gap-2 mb-8">
    <p>&copy; {year} zatsit. Tous droits réservés.</p>
  </div>
</footer>
```

### 3.4 ThemeToggle.astro

Pattern commun **greenscore** + **corporate** :

```astro
<button id="theme-toggle" aria-label="Basculer le thème" title="Basculer le thème"
        class="p-2 rounded-lg hover:bg-surface transition-colors focus:ring-2 focus:ring-primary focus:outline-none">
  <!-- Sun icon (visible en dark mode) -->
  <svg class="theme-icon-light w-5 h-5 hidden" ...>...</svg>
  <!-- Moon icon (visible en light mode) -->
  <svg class="theme-icon-dark w-5 h-5" ...>...</svg>
</button>

<style>
  [data-theme="dark"] .theme-icon-light { display: block; }
  [data-theme="dark"] .theme-icon-dark { display: none; }
</style>

<script>
  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    btn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      btn.setAttribute('aria-label',
        next === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    });
  }
  initThemeToggle();
  document.addEventListener('astro:after-swap', initThemeToggle);
</script>
```

---

## Phase 4 — Migration des pages

### 4.1 Données au build-time

Le TSV sera parsé **une seule fois au build**, pas au runtime :

```astro
---
// src/pages/index.astro
import Layout from "../layouts/Layout.astro";
import { parseTSV } from "../data/tsv-parser";
import { extractTags } from "../data/tag-extractor";
import { readFileSync } from "node:fs";

const tsv = readFileSync("public/tech-watch-v1.tsv", "utf-8");
const entries = parseTSV(tsv);
const tags = extractTags(entries);
---

<Layout title="Zatsit Tech Watch">
  <!-- Contenu statique rendu au build -->
  <!-- Islands pour filtres/recherche (client:load) -->
</Layout>
```

### 4.2 Route dynamique contributeur

```astro
---
// src/pages/contributors/[name].astro
import { parseTSV } from "../../data/tsv-parser";
import { readFileSync } from "node:fs";

export function getStaticPaths() {
  const tsv = readFileSync("public/tech-watch-v1.tsv", "utf-8");
  const entries = parseTSV(tsv);
  const contributors = [...new Set(entries.map(e => e.contributor))];
  return contributors.map(name => ({
    params: { name: encodeURIComponent(name) },
    props: { name, entries: entries.filter(e => e.contributor === name) }
  }));
}

const { name, entries } = Astro.props;
---
```

### 4.3 Stratégie pour l'interactivité

| Fonctionnalité | Approche |
|----------------|----------|
| Filtres / recherche (home) | Island `<script>` vanilla dans la page |
| Tri des colonnes | Island `<script>` vanilla |
| Charts SVG (stats) | Rendu statique au build (pas d'interaction) |
| Tag cloud (hover) | CSS `:hover` + `<script>` léger |
| Heatmap tooltips | `<script>` avec event delegation |
| Theme toggle | `<script>` (pas d'hydration framework) |
| Menu mobile | `<script>` (pattern greenscore) |

> **Aucun framework JS nécessaire** — on garde du vanilla TS dans des `<script>` Astro, comme dans greenscore et corporate.

---

## Phase 5 — Styles (global.css)

Le fichier `src/style.css` actuel migre vers `src/styles/global.css` avec très peu de changements :

```css
@import "tailwindcss";
@import "@fontsource/poppins/400.css";
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";

@theme {
  --font-sans: 'Poppins', system-ui, -apple-system, sans-serif;
  --color-primary: #0f15fd;
  --color-secondary: #3b82f6;
  --color-bg: #ffffff;
  --color-content: #1c1e21;
  --color-surface: rgba(255, 255, 255, 0.6);
  --color-border: #cbd5e1;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* Dark mode (pattern commun greenscore + corporate) */
[data-theme="dark"] {
  --color-primary: #f1be51;
  --color-secondary: #e1601f;
  --color-bg: #1b1b1d;
  --color-content: #e3e3e3;
  --color-surface: rgba(27, 27, 29, 0.6);
  --color-border: rgba(241, 190, 81, 0.2);
}

/* Glass effect (pattern commun) */
.glass {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

/* Text gradient (pattern corporate) */
.text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Reduced motion (a11y — pattern greenscore) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

> **Changement notable** : `@fontsource/poppins` au lieu de Google Fonts CDN → meilleur pour l'éco-conception (pattern greenscore + corporate).

---

## Phase 6 — Ordre de migration recommandé

| Étape | Fichiers concernés | Complexité |
|-------|--------------------|------------|
| 1. Init Astro + config | `astro.config.mjs`, `tsconfig.json`, `package.json` | Faible |
| 2. Layout + Header + Footer + ThemeToggle | `src/layouts/`, `src/components/` | Faible |
| 3. global.css + @fontsource | `src/styles/global.css` | Faible |
| 4. Data layer (TSV au build) | `src/data/` (réutilisation) | Faible |
| 5. Page home (statique + island filtres) | `src/pages/index.astro` | Moyenne |
| 6. Pages contributeurs + [name] | `src/pages/contributors/` | Moyenne |
| 7. Page timeline | `src/pages/timeline.astro` | Faible |
| 8. Page stats + charts SVG | `src/pages/stats.astro`, `src/components/charts/` | Moyenne |
| 9. Page tags | `src/pages/tags.astro` | Faible |
| 10. Page activity + heatmap | `src/pages/activity.astro` | Moyenne |
| 11. Nettoyage (suppr router, store, main.ts, vite.config) | — | Faible |
| 12. Tests unitaires (Vitest) | `tsv-parser`, `tag-extractor`, `stats`, `date utils` | Moyenne |
| 13. Tests E2E (Playwright) | Navigation, filtres, dark mode, responsive, contributeurs | Moyenne |
| 14. Mise à jour docs Claude | `.claude/architecture.md`, `.claude/memory-bank.instructions.md`, `CLAUDE.md` | Faible |
| 15. Déploiement | CI/CD Clever Cloud | Faible |

**Estimation : ~3-4 jours** (le gros du code data/charts/utils est réutilisable tel quel, tests inclus).

### Tests (après migration fonctionnelle)

**Stack alignée sur greenscore** : Vitest (unitaires) + Playwright (E2E).

#### Tests unitaires (Vitest) — après phase 4

```bash
npm install -D vitest
```

Fichiers à tester :
- `src/data/tsv-parser.ts` — parsing TSV, gestion des cas limites
- `src/data/tag-extractor.ts` — extraction de tags, alias dictionary
- `src/data/stats.ts` — calculs statistiques
- `src/utils/date.ts` — formatage de dates
- `src/utils/format.ts` — helpers de formatage

#### Tests E2E (Playwright) — après phase 10

```bash
npm install -D @playwright/test
npx playwright install
```

Scénarios à couvrir :
- Navigation entre toutes les pages
- Filtres et recherche sur la home
- Basculement dark/light mode
- Page contributeur dynamique
- Responsive (mobile / desktop)
- Skip link fonctionnel
- Liens externes (footer social)

### Étape 12 — Mise à jour des fichiers de documentation Claude

Une fois la migration fonctionnelle, mettre à jour :

#### `.claude/architecture.md`
- Remplacer l'arborescence `src/` par la nouvelle structure Astro
- Documenter le flux de données au build (TSV → parseTSV → props Astro → HTML statique)
- Supprimer les références au router hash, store réactif, event bus, main.ts
- Ajouter les patterns Astro : Layout → slot, getStaticPaths, `<script>` islands

#### `.claude/memory-bank.instructions.md`
- Mettre à jour le contexte technique (Astro au lieu de Vite vanilla)
- Documenter les décisions de migration (pourquoi Astro, ce qui a changé)
- Ajouter les patterns architecturaux Astro (SSG, file-based routing, no hydration)
- Mettre à jour les références aux fichiers supprimés/renommés

#### `CLAUDE.md`
- Mettre à jour la section Technology Stack (ajouter Astro 5.x)
- Mettre à jour les Available Scripts (`astro dev`, `astro check && astro build`, `astro preview`)
- Mettre à jour la Project Structure avec l'arborescence Astro
- Mettre à jour la section Routes (file-based au lieu de hash)
- Ajouter le skill `astro-zatsit-conventions` dans la liste des skills

---

## Règles d'harmonisation Zatsit

### Conventions communes à tous les projets

1. **Astro 5.x** avec `output: 'static'` (SSG par défaut)
2. **Tailwind v4** via `@tailwindcss/vite` (pas de `tailwind.config.js`)
3. **TypeScript strict** : `extends: "astro/tsconfigs/strict"`
4. **Font self-hosted** : `@fontsource/poppins` (pas de Google Fonts CDN)
5. **Dark mode** : attribut `data-theme` sur `<html>` + localStorage
6. **FOUC prevention** : script inline dans `<head>` pour appliquer le thème avant le paint
7. **Skip link** : toujours présent dans Layout.astro
8. **Footer social** : Blog + LinkedIn + GitHub (icônes rondes, couleur primary)
9. **Couleurs brand** : `--color-primary` = `#0f15fd` (light) / `#f1be51` (dark)
10. **Glass effect** : `backdrop-filter: blur()` + surface semi-transparente
11. **Commits** : convention Angular `type(scope): description`
12. **Lang** : code en anglais, contenu utilisateur en français
13. **Fichiers** : kebab-case, composants PascalCase
14. **A11y** : aria-labels, semantic HTML, focus visible, `prefers-reduced-motion`
15. **Éco-conception** : < 500KB par page, pas de tracking, images optimisées
