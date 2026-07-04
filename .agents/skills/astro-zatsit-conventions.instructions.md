---
description: 'Zatsit-specific Astro conventions and shared patterns across all Zatsit projects (greenscore, websites, cv-generator, tech-watcher)'
applyTo: '**/*.astro, astro.config.*, src/layouts/*, src/components/Header.astro, src/components/Footer.astro, src/components/ThemeToggle.astro'
---

# Zatsit Astro Conventions

Conventions derived from existing Zatsit projects: zats-greenscore, zats-websites (corporate), zats-cv-generator.

## Project Setup

### astro.config.mjs — Standard template

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://<project>.zatsit.fr',
  compressHTML: true,
  prefetch: { defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### tsconfig.json — Always strict

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

## Layout Pattern

Every Zatsit Astro project MUST have a `src/layouts/Layout.astro` with:

1. **Self-hosted Poppins font** via `@fontsource/poppins` (NOT Google Fonts CDN — eco-design)
2. **FOUC prevention inline script** that reads localStorage and applies `data-theme` before first paint
3. **Skip link** as first child of `<body>`: `<a href="#main-content" class="sr-only focus:not-sr-only ...">Aller au contenu principal</a>`
4. **Semantic structure**: `<Header />` → `<main id="main-content">` → `<Footer />`
5. **Meta tags**: charset, viewport, description, OG tags with `og:locale="fr_FR"`
6. **`lang="fr"`** on `<html>` element
7. **`data-theme="light"`** default on `<html>` element

## Header Pattern

All Zatsit headers share:
- Sticky positioning with glass effect (`backdrop-filter: blur()`)
- Logo (Zatsit SVG sigle) + project name with `.text-gradient`
- Desktop nav links (hidden on mobile via `hidden lg:flex`)
- Theme toggle button
- Mobile hamburger menu with `aria-expanded`, `aria-controls`
- `<nav aria-label="Navigation principale">`
- Active link highlighted with `aria-current="page"`

## Footer Pattern

All Zatsit footers share:
- Top border separator
- Social links row: Blog, LinkedIn, GitHub (circular primary-colored buttons, 34×34px)
- All external links: `target="_blank" rel="noopener noreferrer"` + `aria-label` mentioning "ouvre un nouvel onglet"
- Copyright: `© {year} zatsit. Tous droits réservés.`
- Dynamic year via `new Date().getFullYear()`

## ThemeToggle Pattern

- Button with `aria-label="Basculer le thème"`
- Sun icon (visible in dark) / Moon icon (visible in light) via CSS scoped to `[data-theme]`
- Persists to `localStorage.setItem('theme', ...)`
- Updates `document.documentElement.setAttribute('data-theme', ...)`
- Re-initializes on `astro:after-swap` (for ViewTransitions)
- Respects `prefers-reduced-motion`

## Dark Mode Implementation

```css
:root, [data-theme="light"] {
  --color-primary: #0f15fd;    /* Zatsit blue */
  --color-bg: #ffffff;
  --color-content: #1c1e21;
  --color-surface: rgba(255, 255, 255, 0.6);
}

[data-theme="dark"] {
  --color-primary: #f1be51;    /* Zatsit gold */
  --color-bg: #1b1b1d;
  --color-content: #e3e3e3;
  --color-surface: rgba(27, 27, 29, 0.6);
}
```

## Interactivity Strategy

Zatsit Astro projects use **vanilla TypeScript** in `<script>` tags — NO React, Vue, or other UI frameworks.

- Static content: rendered at build time in `.astro` components
- Interactive features: `<script>` blocks in `.astro` files with DOM manipulation
- No `client:*` hydration directives needed (no framework islands)
- Event delegation for lists and grids

## Eco-Design Rules

1. **Self-hosted fonts** (`@fontsource/*`) — no external CDN calls
2. **< 500KB per page** total weight
3. **No tracking scripts** (no analytics, no cookies banners unless legally required)
4. **SVG icons** — no icon font libraries
5. **Static generation** — minimize client-side JS
6. **System fonts as fallback** in font stack
7. **Lazy loading** on images below the fold

## Accessibility Checklist (every page)

- [ ] Skip link present and functional
- [ ] Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Heading hierarchy (h1 → h2 → h3) without skips
- [ ] All interactive elements have `aria-label` or visible text
- [ ] Focus visible on all interactive elements (`focus:ring-2 focus:ring-primary`)
- [ ] Decorative SVGs have `aria-hidden="true"`
- [ ] External links indicate they open a new tab
- [ ] Color is never the sole indicator (use text/icons alongside)
- [ ] `prefers-reduced-motion` respected
- [ ] Touch targets ≥ 44×44px

## File Naming

- Components: `PascalCase.astro` (e.g., `EntryCard.astro`)
- Pages: `kebab-case.astro` (e.g., `legal-notice.astro`)
- Utilities/data: `kebab-case.ts` (e.g., `tsv-parser.ts`)
- Styles: `global.css` in `src/styles/`
- Dynamic routes: `[param].astro` with `getStaticPaths()`

## Social Links (shared across all projects)

```
Blog:     https://blog.zatsit.fr/
LinkedIn: https://www.linkedin.com/company/zatsit/
GitHub:   https://github.com/zatsit-oss
```
