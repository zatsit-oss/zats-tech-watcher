import { getState, subscribe } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { computeStats } from "../data/stats.ts";
import { renderBarChart } from "../charts/bar-chart.ts";
import { renderLineChart } from "../charts/line-chart.ts";
import { renderDonutChart } from "../charts/donut-chart.ts";
import { formatDate } from "../utils/date.ts";
import { qs } from "../utils/dom.ts";

export function mountStatsDashboard(): void {
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

  const stats = computeStats(entries);

  container.innerHTML = `
    <div class="page-enter">
      <h1 class="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
      <p class="text-content-muted text-sm mb-8">Statistiques de la veille technologique</p>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${renderSummaryCard("Ressources", String(stats.totalEntries), "Du " + formatDate(stats.dateRange.from) + " au " + formatDate(stats.dateRange.to))}
        ${renderSummaryCard("Contributeurs", String(stats.totalContributors), "actifs sur la période")}
        ${renderSummaryCard("Tags", String(stats.totalTags), "catégories identifiées")}
        ${renderSummaryCard("Moyenne", (stats.totalEntries / Math.max(stats.byMonth.length, 1)).toFixed(1) + "/mois", "rythme de contributions")}
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Entries per month -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Évolution mensuelle</h3>
          ${renderLineChart(
            stats.byMonth.map((m) => ({ label: m.label, value: m.count }))
          )}
        </div>

        <!-- Tag distribution -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Répartition par tag</h3>
          ${renderDonutChart(
            stats.byTag.slice(0, 10).map((t) => ({
              label: t.tag,
              value: t.count,
            }))
          )}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top tags -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Top Tags</h3>
          ${renderBarChart(
            stats.byTag.slice(0, 12).map((t) => ({
              label: t.tag,
              value: t.count,
            }))
          )}
        </div>

        <!-- Top contributors -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Top Contributeurs</h3>
          ${renderBarChart(
            stats.byContributor.slice(0, 10).map((c) => ({
              label: c.name.split(" ")[0],
              value: c.count,
            }))
          )}
        </div>
      </div>
    </div>
  `;
}

function renderSummaryCard(
  title: string,
  value: string,
  subtitle: string
): string {
  return `
    <div class="glass rounded-xl p-5 text-center">
      <p class="text-xs text-content-muted uppercase tracking-wider mb-1">${title}</p>
      <p class="text-2xl font-bold gradient-text">${value}</p>
      <p class="text-xs text-content-muted mt-1">${subtitle}</p>
    </div>
  `;
}
