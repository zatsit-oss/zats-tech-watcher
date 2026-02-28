import { getState, subscribe } from "../core/store.ts";
import { setCleanup, navigate } from "../core/router.ts";
import { computeTagStats } from "../data/stats.ts";
import { renderTagCloudSvg } from "../charts/tag-cloud-svg.ts";
import { renderBarChart } from "../charts/bar-chart.ts";
import { qs } from "../utils/dom.ts";

export function mountTagCloud(): void {
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

  const tagStats = computeTagStats(entries);
  const trending = tagStats
    .filter((t) => t.trend > 0)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 5);

  container.innerHTML = `
    <div class="page-enter">
      <h1 class="text-3xl font-bold gradient-text mb-2">Tags</h1>
      <p class="text-content-muted text-sm mb-8">Nuage de tags et tendances</p>

      <!-- Tag cloud -->
      <div class="glass rounded-xl p-6 mb-8">
        <h3 class="text-sm font-semibold text-content mb-4">Nuage de tags</h3>
        <div id="tag-cloud-container">
          ${renderTagCloudSvg(
            tagStats.map((t) => ({ tag: t.tag, count: t.count, trend: t.trend }))
          )}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Trending tags -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Tendances montantes</h3>
          ${
            trending.length > 0
              ? `<div class="space-y-3">
                  ${trending.map((t) => renderTrendItem(t.tag, t.count, t.trend)).join("")}
                </div>`
              : `<p class="text-sm text-content-muted">Pas assez de données pour les tendances</p>`
          }
        </div>

        <!-- Tag distribution bar chart -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-sm font-semibold text-content mb-4">Distribution des tags</h3>
          ${renderBarChart(
            tagStats.slice(0, 12).map((t) => ({ label: t.tag, value: t.count }))
          )}
        </div>
      </div>

      <!-- All tags table -->
      <div class="glass rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-edge">
              <th class="text-left px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">Tag</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">Entries</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider hidden sm:table-cell">Contributeurs</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">Tendance</th>
            </tr>
          </thead>
          <tbody>
            ${tagStats
              .map(
                (t) => `
                <tr class="border-b border-edge hover:bg-bg-alt transition-colors cursor-pointer" data-tag-row="${t.tag}">
                  <td class="px-4 py-3"><span class="tag-badge">${t.tag}</span></td>
                  <td class="px-4 py-3 text-right font-semibold text-primary">${t.count}</td>
                  <td class="px-4 py-3 text-right text-content-muted hidden sm:table-cell">${t.contributors.length}</td>
                  <td class="px-4 py-3 text-right">
                    ${
                      t.trend > 0
                        ? `<span class="text-green-500 font-medium">+${t.trend}</span>`
                        : t.trend < 0
                          ? `<span class="text-red-400 font-medium">${t.trend}</span>`
                          : `<span class="text-content-muted">—</span>`
                    }
                  </td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind tag cloud click
  container.querySelectorAll("#tag-cloud-container text[data-tag]").forEach((el) => {
    el.addEventListener("click", () => {
      const tag = (el as SVGTextElement).dataset.tag;
      if (tag) navigate("/");
      // Will navigate to home, user can then filter
    });
  });

  // Bind tag row click
  container.querySelectorAll("[data-tag-row]").forEach((el) => {
    el.addEventListener("click", () => {
      navigate("/");
    });
  });
}

function renderTrendItem(tag: string, count: number, trend: number): string {
  return `
    <div class="flex items-center justify-between p-3 rounded-lg bg-bg-alt">
      <div class="flex items-center gap-3">
        <span class="tag-badge">${tag}</span>
        <span class="text-xs text-content-muted">${count} entries</span>
      </div>
      <div class="flex items-center gap-1 text-green-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
        <span class="text-sm font-medium">+${trend}</span>
      </div>
    </div>
  `;
}
