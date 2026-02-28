import { getState, subscribe } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { computeContributorProfiles } from "../data/stats.ts";
import { renderTagBadge } from "../components/tag-badge.ts";
import { qs } from "../utils/dom.ts";

const MEDALS = ["🥇", "🥈", "🥉"];

export function mountContributors(): void {
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

  const profiles = computeContributorProfiles(entries);

  container.innerHTML = `
    <div class="page-enter">
      <h1 class="text-3xl font-bold gradient-text mb-2">Contributeurs</h1>
      <p class="text-content-muted text-sm mb-8">${profiles.length} contributeurs actifs</p>

      <!-- Top 3 podium -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        ${profiles
          .slice(0, 3)
          .map((p, i) => renderPodiumCard(p.name, p.count, p.topTags.map((t) => t.tag), i))
          .join("")}
      </div>

      <!-- Full leaderboard -->
      <div class="glass rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-edge">
              <th class="text-left px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">#</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">Contributeur</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider hidden sm:table-cell">Tags principaux</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">Entries</th>
            </tr>
          </thead>
          <tbody>
            ${profiles.map((p, i) => renderRow(p.name, p.count, p.topTags.slice(0, 3).map((t) => t.tag), i)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPodiumCard(
  name: string,
  count: number,
  tags: string[],
  rank: number
): string {
  const medal = MEDALS[rank] ?? "";
  const sizes = ["text-5xl", "text-4xl", "text-3xl"];
  return `
    <div class="glass rounded-xl p-6 text-center glass-hover">
      <div class="${sizes[rank]} mb-3">${medal}</div>
      <a href="#/contributors/${encodeURIComponent(name)}" class="text-lg font-bold text-content hover:text-primary transition-colors">${name}</a>
      <p class="text-2xl font-bold gradient-text mt-1">${count}</p>
      <p class="text-xs text-content-muted mb-3">contributions</p>
      <div class="flex flex-wrap justify-center gap-1">
        ${tags.slice(0, 3).map((t) => renderTagBadge(t, false, false)).join("")}
      </div>
    </div>
  `;
}

function renderRow(
  name: string,
  count: number,
  tags: string[],
  index: number
): string {
  const medal = index < 3 ? MEDALS[index] + " " : "";
  return `
    <tr class="border-b border-edge hover:bg-bg-alt transition-colors">
      <td class="px-4 py-3 text-content-muted">${medal}${index + 1}</td>
      <td class="px-4 py-3">
        <a href="#/contributors/${encodeURIComponent(name)}" class="font-medium text-content hover:text-primary transition-colors">${name}</a>
      </td>
      <td class="px-4 py-3 hidden sm:table-cell">
        <div class="flex gap-1 flex-wrap">${tags.map((t) => renderTagBadge(t, false, false)).join("")}</div>
      </td>
      <td class="px-4 py-3 text-right font-semibold text-primary">${count}</td>
    </tr>
  `;
}
