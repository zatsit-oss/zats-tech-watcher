# zats-tech-watcher

[![Astro](https://img.shields.io/badge/Astro-5.x-bc52ee?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/Playwright-e2e-2ead33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Vitest](https://img.shields.io/badge/Vitest-unit-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![WCAG](https://img.shields.io/badge/WCAG-AA%20compliant-228b22)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/github/license/zatsit-oss/zats-tech-watcher)](LICENSE)

An internal **tech watch portal** for teams. Browse, filter, and explore articles shared by contributors, with interactive visualizations (timeline, statistics, tag cloud, activity heatmap).

---

## 🚀 Features

- **Grid / List View:** Browse articles with search, sort, and tag filtering
- **Contributors:** Leaderboard (podium) and individual profile pages
- **Timeline:** Vertical chronological view (month/week toggle)
- **Statistics:** Dashboard with 4 SVG charts (bar, line, donut, tag-cloud)
- **Tags:** Tag cloud, trends, and distribution
- **Activity:** GitHub-style heatmap with streak statistics
- **Accessible:** WCAG AA compliant, keyboard navigable, dark/light theme
- **Eco-Designed:** Static pages, no client-side JS framework, native SVGs

---

## 🛠️ Technology Stack

- **Framework:** [Astro](https://astro.build) 5.x — Static site generator
- **Styling:** [Tailwind CSS](https://tailwindcss.com) 4.x — CSS-first config via `@theme`
- **Language:** [TypeScript](https://www.typescriptlang.org) 5.x — Vanilla TS (no React/Vue)
- **Testing:** [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (e2e)
- **Font:** [Poppins](https://fontsource.org/fonts/poppins) self-hosted via `@fontsource`
- **Deployment:** [Google Cloud Storage](https://cloud.google.com/storage) (production) · [Firebase Hosting](https://firebase.google.com/docs/hosting) (PR previews)

---

## 📄 Data Source

The portal reads its data from a **TSV (Tab-Separated Values)** file located at `public/tech-watch-v1.tsv`. You must provide your own data file in this format.

The file is kept in sync with a Google Sheet by the `sync-data.yml` workflow (weekly cron + manual dispatch): it downloads the sheet with a service account (`GOOGLE_SHEETS_SA_KEY` and `TECH_WATCH_SHEET_ID` secrets), normalizes it via `scripts/sync-tech-watch-data.mjs` (canonical header, LF endings, row validation) and opens a pull request when the data changed. The script also works offline: `node scripts/sync-tech-watch-data.mjs --from-file export.tsv`.

### File format

The first line must be the header row. Each subsequent line is one entry, with columns separated by **tabs**:

| Column | Name | Required | Format | Description |
| :----- | :--- | :------: | :----- | :---------- |
| 1 | `Date` | Yes | `DD/MM/YYYY` | Publication or sharing date |
| 2 | `Contributors` | Yes | Free text | Contributor name |
| 3 | `Topics` | No | Free text | Subject or topic description (used for tag extraction) |
| 4 | `Links` | Yes | URL | Link to the article or resource |
| 5 | `Tags` | No | Free text | *(currently unused — tags are auto-extracted from `Topics`)* |

### Example

```tsv
Date	Contributors	Topics	Links	Tags
30/01/2025	John Doe	open-source AI code assistant	https://continue.dev
28/02/2025	Jane Smith	API testing and quality tools	https://example.com
```

> **Note:** Tags are automatically extracted from the `Topics` column using a built-in alias dictionary (~50 terms). You do not need to fill the `Tags` column manually.

---

## 📦 Installation

### Prerequisites

- Node.js **v20+** and npm **v10+**

### Steps

1. Clone the repository:
```sh
git clone https://github.com/zatsit-oss/zats-tech-watcher
cd zats-tech-watcher
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Build for production:
```sh
npm run build
```

5. Preview the build:
```sh
npm run preview
```

---

## 🧞 Commands

| Command               | Action                                          |
| :-------------------- | :---------------------------------------------- |
| `npm install`         | Install dependencies                            |
| `npm run dev`         | Start local dev server at `localhost:4321`       |
| `npm run build`       | Type check + build production to `./dist/`      |
| `npm run preview`     | Preview production build locally                |
| `npm run test`        | Run unit tests (Vitest)                         |
| `npm run test:e2e`    | Build + run e2e tests (Playwright)              |
| `npm run test:watch`  | Run unit tests in watch mode                    |

---

## 🚀 Project Structure

```text
src/
├── layouts/            # HTML layout (head, header, footer)
├── components/         # Astro components + TS modules
├── pages/              # File-based routing
│   └── contributors/   # Contributor pages (index + [name])
├── data/               # TSV data loading and parsing
├── charts/             # SVG chart components (bar, line, donut, heatmap)
├── styles/             # Global CSS (@theme Tailwind v4)
├── types.ts            # Shared TypeScript interfaces
└── utils/              # Helpers (date, dom, debounce, format)

tests/                  # Unit tests (Vitest)
e2e/                    # E2E tests (Playwright)
public/
└── tech-watch-v1.tsv   # Data source (synced from Google Sheet)
```

---

## 🤝 Contributing

Contributions are welcome! Contributing guidelines will be published soon.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 📧 Contact

For questions, suggestions, or feedback, reach out to us at support@zatsit.fr.
