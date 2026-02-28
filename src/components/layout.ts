import { renderHeader } from "./header.ts";

export function renderLayout(): string {
  return `
    ${renderHeader()}
    <main id="main-content" role="main" aria-label="Contenu principal" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-160px)]">
      <div id="page-container"></div>
    </main>
    <footer role="contentinfo" class="glass border-t border-edge mt-auto py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-content-muted">
        <p>Zatsit Tech Watch — Veille technologique collaborative</p>
      </div>
    </footer>
  `;
}
