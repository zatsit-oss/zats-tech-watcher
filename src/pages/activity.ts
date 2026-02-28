import { getState, subscribe } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { renderHeatmapSvg } from "../charts/heatmap-svg.ts";
import type { DayActivity } from "../charts/heatmap-svg.ts";
import type { TechWatchEntry } from "../types.ts";
import { qs } from "../utils/dom.ts";

export function mountActivity(): void {
  const container = qs<HTMLElement>("#page-container");
  if (!container) return;

  const unsub = subscribe(() => render(container));
  render(container);
  setCleanup(() => unsub());
}

function render(container: HTMLElement): void {
  const { entries, loading } = getState();
  if (loading) {
    container.innerHTML = `<div class="skeleton h-96 rounded-xl"></div>`;
    return;
  }

  const dayMap = buildDayMap(entries);
  const dayData: DayActivity[] = Array.from(dayMap.entries()).map(([date, entries]) => ({
    date,
    count: entries.length,
  }));

  const totalEntries = entries.length;
  const activeDays = dayData.filter((d) => d.count > 0).length;
  const maxStreak = computeMaxStreak(dayMap);
  const avgPerWeek = totalEntries > 0 ? (totalEntries / Math.max(getWeekSpan(entries), 1)).toFixed(1) : "0";

  // Top 5 most active days
  const topDays = [...dayMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  container.innerHTML = `
    <div class="page-enter">
      <h1 class="text-3xl font-bold gradient-text mb-2">Activité</h1>
      <p class="text-content-muted text-sm mb-8">Calendrier des contributions</p>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${renderStat("Ressources", String(totalEntries), "au total")}
        ${renderStat("Jours actifs", String(activeDays), "avec contributions")}
        ${renderStat("Streak max", String(maxStreak) + " j.", "jours consécutifs")}
        ${renderStat("Moyenne", avgPerWeek + "/sem.", "contributions par semaine")}
      </div>

      <!-- Heatmap -->
      <div class="glass rounded-xl p-6 mb-8 overflow-x-auto">
        <h3 class="text-sm font-semibold text-content mb-4">Contributions sur l'année</h3>
        ${renderHeatmapSvg(dayData)}
        <!-- Legend -->
        <div class="flex items-center justify-end gap-2 mt-4 text-xs text-content-muted">
          <span>Moins</span>
          ${renderLegendCells()}
          <span>Plus</span>
        </div>
      </div>

      <!-- Top active days -->
      <div class="glass rounded-xl p-6">
        <h3 class="text-sm font-semibold text-content mb-4">Jours les plus actifs</h3>
        <div class="space-y-3">
          ${topDays.map(([dateKey, dayEntries]) => renderTopDay(dateKey, dayEntries)).join("")}
        </div>
      </div>
    </div>
  `;
}

function buildDayMap(entries: TechWatchEntry[]): Map<string, TechWatchEntry[]> {
  const map = new Map<string, TechWatchEntry[]>();
  for (const entry of entries) {
    const key = entry.date.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return map;
}

function computeMaxStreak(dayMap: Map<string, TechWatchEntry[]>): number {
  const sortedDays = [...dayMap.keys()].sort();
  if (sortedDays.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

function getWeekSpan(entries: TechWatchEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = entries.map((e) => e.date.getTime());
  const range = Math.max(...dates) - Math.min(...dates);
  return Math.max(Math.ceil(range / (7 * 86400000)), 1);
}

function renderStat(title: string, value: string, subtitle: string): string {
  return `
    <div class="glass rounded-xl p-5 text-center">
      <p class="text-xs text-content-muted uppercase tracking-wider mb-1">${title}</p>
      <p class="text-2xl font-bold gradient-text">${value}</p>
      <p class="text-xs text-content-muted mt-1">${subtitle}</p>
    </div>
  `;
}

function renderLegendCells(): string {
  const levels = [
    "var(--color-bg-alt)",
    "color-mix(in srgb, var(--color-primary) 25%, transparent)",
    "color-mix(in srgb, var(--color-primary) 50%, transparent)",
    "color-mix(in srgb, var(--color-primary) 75%, transparent)",
    "var(--color-primary)",
  ];
  return levels
    .map(
      (fill) =>
        `<span class="inline-block w-3 h-3 rounded-sm" style="background:${fill}"></span>`
    )
    .join("");
}

function renderTopDay(dateKey: string, entries: TechWatchEntry[]): string {
  const [y, m, d] = dateKey.split("-");
  const dateLabel = `${d}/${m}/${y}`;

  return `
    <div class="flex items-start gap-4 py-2 border-b border-edge last:border-0">
      <div class="flex-shrink-0 w-20 text-sm font-medium text-content">${dateLabel}</div>
      <div class="flex-shrink-0 w-8 text-sm font-bold gradient-text">${entries.length}</div>
      <div class="text-sm text-content-muted truncate">${entries.map((e) => e.subject).join(", ")}</div>
    </div>
  `;
}
