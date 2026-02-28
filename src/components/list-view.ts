import type { TechWatchEntry } from "../types.ts";
import { renderListItem } from "./list-item.ts";

export function renderListView(entries: TechWatchEntry[]): string {
  if (entries.length === 0) {
    return `
      <div class="glass rounded-xl p-12 text-center">
        <h3 class="text-lg font-semibold text-content-muted mb-2">Aucun résultat</h3>
        <p class="text-sm text-content-muted">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    `;
  }

  return `
    <div class="glass rounded-xl divide-y divide-edge">
      ${entries.map((e, i) => renderListItem(e, i)).join("")}
    </div>
  `;
}
