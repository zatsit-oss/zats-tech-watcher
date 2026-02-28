import type { TechWatchEntry } from "../types.ts";
import { truncate } from "../utils/format.ts";
import { renderTagBadge } from "./tag-badge.ts";

export function renderCardItem(entry: TechWatchEntry): string {
  return `
    <article class="glass rounded-xl p-5 transition-all duration-200 glass-hover flex flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <span class="text-xs text-content-muted font-medium">${entry.dateStr}</span>
        <span class="text-xs text-content-muted truncate max-w-[120px]">${entry.domain}</span>
      </div>
      <h3 class="text-sm font-semibold leading-snug line-clamp-2 text-content">
        ${truncate(entry.subject, 100)}
      </h3>
      <div class="flex flex-wrap gap-1.5">
        ${entry.tags.map((t) => renderTagBadge(t, false, true)).join("")}
      </div>
      <div class="mt-auto flex items-center justify-between pt-2 border-t border-edge">
        <a href="#/contributors/${encodeURIComponent(entry.contributor)}" class="text-xs font-medium text-primary hover:underline">
          ${entry.contributor}
        </a>
        <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-content-muted hover:text-primary transition-colors flex items-center gap-1">
          Ouvrir
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </article>
  `;
}
