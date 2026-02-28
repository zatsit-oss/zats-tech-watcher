import { getState, subscribe } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { groupByDate, monthKey, monthLabel, weekKey } from "../utils/date.ts";
import { renderTagBadge } from "../components/tag-badge.ts";
import { qs } from "../utils/dom.ts";
import type { TechWatchEntry } from "../types.ts";

type GroupMode = "month" | "week";

let currentMode: GroupMode = "month";

export function mountTimeline(): void {
  const container = qs<HTMLElement>("#page-container");
  if (!container) return;

  const unsub = subscribe(() => render(container));
  render(container);
  setCleanup(() => {
    unsub();
    currentMode = "month";
  });
}

function render(container: HTMLElement): void {
  const { entries, loading } = getState();
  if (loading) {
    container.innerHTML = `<div class="skeleton h-96 rounded-xl"></div>`;
    return;
  }

  const sorted = [...entries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  const keyFn = currentMode === "month" ? monthKey : weekKey;
  const groups = groupByDate(sorted, (e) => e.date, keyFn);
  const sortedKeys = Array.from(groups.keys()).sort().reverse();

  container.innerHTML = `
    <div class="page-enter">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold gradient-text mb-2">Timeline</h1>
          <p class="text-content-muted text-sm">Vue chronologique des contributions</p>
        </div>
        <div class="flex items-center gap-1 glass rounded-lg p-1">
          <button data-mode="month" class="timeline-mode-btn px-3 py-1.5 rounded-md text-sm transition-colors ${currentMode === "month" ? "bg-primary text-white" : "text-content-muted hover:text-content"}">Mois</button>
          <button data-mode="week" class="timeline-mode-btn px-3 py-1.5 rounded-md text-sm transition-colors ${currentMode === "week" ? "bg-primary text-white" : "text-content-muted hover:text-content"}">Semaine</button>
        </div>
      </div>

      <div class="relative">
        <!-- Vertical line -->
        <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-edge-solid"></div>

        ${sortedKeys.map((key) => renderGroup(key, groups.get(key)!)).join("")}
      </div>
    </div>
  `;

  // Bind mode toggle
  container.querySelectorAll(".timeline-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = (btn as HTMLElement).dataset.mode as GroupMode;
      render(container);
    });
  });
}

function renderGroup(key: string, entries: TechWatchEntry[]): string {
  const label = currentMode === "month" ? monthLabel(entries[0].date) : key;

  return `
    <div class="relative pl-12 pb-8">
      <!-- Dot -->
      <div class="absolute left-2.5 top-1 w-4 h-4 rounded-full bg-primary border-4 border-bg"></div>
      <div class="mb-3">
        <h3 class="text-lg font-bold text-content">${label}</h3>
        <span class="text-xs text-content-muted">${entries.length} entrée${entries.length > 1 ? "s" : ""}</span>
      </div>
      <div class="space-y-2">
        ${entries.map(renderTimelineEntry).join("")}
      </div>
    </div>
  `;
}

function renderTimelineEntry(entry: TechWatchEntry): string {
  return `
    <div class="glass rounded-lg p-3 glass-hover transition-all duration-200">
      <div class="flex items-start justify-between gap-2 mb-1">
        <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-content hover:text-primary transition-colors">
          ${entry.subject}
        </a>
        <span class="text-xs text-content-muted shrink-0">${entry.dateStr}</span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <a href="#/contributors/${encodeURIComponent(entry.contributor)}" class="text-xs text-primary hover:underline">${entry.contributor}</a>
        <span class="text-xs text-content-muted">·</span>
        <span class="text-xs text-content-muted">${entry.domain}</span>
        <span class="text-xs text-content-muted">·</span>
        <div class="flex gap-1">${entry.tags.map((t) => renderTagBadge(t, false, false)).join("")}</div>
      </div>
    </div>
  `;
}
