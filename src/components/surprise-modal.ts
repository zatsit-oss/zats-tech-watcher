import type { TechWatchEntry } from "../types.ts";
import { renderTagBadge } from "./tag-badge.ts";
import { truncate } from "../utils/format.ts";
import { formatDate } from "../utils/date.ts";
import { siteConfig } from "../config.ts";

export function renderSurpriseModal(entry: TechWatchEntry): string {
  return `
    <div id="surprise-modal" class="fixed inset-0 z-50 flex items-center justify-center page-enter" role="dialog" aria-modal="true">
      <div id="surprise-overlay" class="absolute inset-0 bg-black/50"></div>
      <div class="relative glass rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4 border border-edge shadow-xl">
        <button id="surprise-close" class="absolute top-3 right-3 p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-bg-alt transition-colors" aria-label="Fermer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div id="surprise-content">
          ${renderSurpriseContent(entry)}
        </div>

        <div class="flex gap-3 mt-6">
          <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Ouvrir le lien
          </a>
          <button id="surprise-another" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass border border-edge text-content text-sm font-medium hover:bg-bg-alt transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Autre surprise
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderSurpriseContent(entry: TechWatchEntry): string {
  const tags = entry.tags
    .map((t) => renderTagBadge(t, false, false))
    .join("");

  return `
    <div class="flex items-center gap-2 text-xs text-content-muted mb-3">
      <span>${formatDate(entry.date)}</span>
      <span class="w-1 h-1 rounded-full bg-content-muted"></span>
      <span>${entry.domain}</span>
    </div>
    <h2 class="text-lg font-bold text-content mb-3">${truncate(entry.subject, 120)}</h2>
    <div class="flex flex-wrap gap-1.5 mb-3">${tags}</div>
    ${siteConfig.showRanking
      ? `<a href="/contributors/${encodeURIComponent(entry.contributor)}/" class="text-sm text-primary hover:underline">${entry.contributor}</a>`
      : `<span class="text-sm text-content-muted">${entry.contributor}</span>`}
  `;
}
