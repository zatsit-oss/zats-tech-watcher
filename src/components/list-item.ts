import type { TechWatchEntry } from "../types.ts";
import { escapeHtml } from "../utils/format.ts";
import { renderTagBadge } from "./tag-badge.ts";
import { renderContributorName } from "./contributor-name.ts";

export function renderListItem(entry: TechWatchEntry, index: number): string {
  return `
    <div class="flex items-start gap-3 py-3 px-4 hover:bg-bg-alt rounded-lg transition-colors group">
      <span class="text-xs text-content-muted font-mono mt-0.5 w-6 text-right shrink-0">${index + 1}.</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-start gap-2">
          <a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-content hover:text-primary transition-colors leading-snug">
            ${escapeHtml(entry.subject)}
          </a>
          <span class="text-xs text-content-muted shrink-0">(${escapeHtml(entry.domain)})</span>
        </div>
        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
          <span class="text-xs text-content-muted">${escapeHtml(entry.dateStr)}</span>
          <span class="text-xs text-content-muted">·</span>
          ${renderContributorName(entry.contributor)}
          <span class="text-xs text-content-muted">·</span>
          <div class="flex gap-1 flex-wrap">
            ${entry.tags.map((t) => renderTagBadge(t, false, true)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
