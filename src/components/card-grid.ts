import type { TechWatchEntry } from "../types.ts";
import { renderCardItem } from "./card-item.ts";

export function renderCardGrid(entries: TechWatchEntry[]): string {
  if (entries.length === 0) {
    return renderEmptyState();
  }

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${entries.map(renderCardItem).join("")}
    </div>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="glass rounded-xl p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-content-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <h3 class="text-lg font-semibold text-content-muted mb-2">Aucun résultat</h3>
      <p class="text-sm text-content-muted">Essayez de modifier vos filtres ou votre recherche.</p>
    </div>
  `;
}
