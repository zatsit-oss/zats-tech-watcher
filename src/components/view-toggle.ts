import type { ViewMode } from "../types.ts";

export function renderViewToggle(current: ViewMode): string {
  return `
    <div class="flex items-center gap-1 glass rounded-lg p-1">
      <button data-view="grid" class="view-toggle-btn p-1.5 rounded-md transition-colors ${current === "grid" ? "bg-primary text-white" : "text-content-muted hover:text-content"}" aria-label="Vue grille">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      </button>
      <button data-view="list" class="view-toggle-btn p-1.5 rounded-md transition-colors ${current === "list" ? "bg-primary text-white" : "text-content-muted hover:text-content"}" aria-label="Vue liste">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
  `;
}
