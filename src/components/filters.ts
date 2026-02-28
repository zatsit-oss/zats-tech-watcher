import { getState } from "../core/store.ts";
import { renderTagBadge } from "./tag-badge.ts";

export function renderFilters(): string {
  const { allTags, contributors, filters } = getState();

  return `
    <div class="flex flex-col gap-4">
      <!-- Tag filters -->
      <div>
        <h4 class="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Tags</h4>
        <div id="tag-filters" class="flex flex-wrap gap-1.5">
          ${allTags.map((t) => renderTagBadge(t, filters.tags.includes(t))).join("")}
        </div>
      </div>
      <!-- Contributor filter -->
      <div class="flex flex-wrap gap-3 items-center">
        <div>
          <select id="contributor-filter" class="text-sm rounded-lg px-3 py-2 glass border border-edge text-content bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-30">
            <option value="">Tous les contributeurs</option>
            ${contributors.map((c) => `<option value="${c}" ${filters.contributor === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        ${
          filters.tags.length > 0 || filters.contributor || filters.search
            ? `<button id="clear-filters" class="text-xs text-primary hover:underline">Effacer les filtres</button>`
            : ""
        }
      </div>
    </div>
  `;
}
