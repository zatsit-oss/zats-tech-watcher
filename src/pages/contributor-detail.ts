import { getState, subscribe } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { computeContributorProfiles } from "../data/stats.ts";
import { renderCardGrid } from "../components/card-grid.ts";
import { formatDate } from "../utils/date.ts";
import { qs } from "../utils/dom.ts";

export function mountContributorDetail(name: string): void {
  const container = qs<HTMLElement>("#page-container");
  if (!container) return;

  const unsub = subscribe(() => render(container, name));
  render(container, name);
  setCleanup(() => unsub());
}

function render(container: HTMLElement, name: string): void {
  const { entries, loading } = getState();
  if (loading) {
    container.innerHTML = `<div class="skeleton h-96 rounded-xl"></div>`;
    return;
  }

  const profiles = computeContributorProfiles(entries);
  const profile = profiles.find((p) => p.name === name);

  if (!profile) {
    container.innerHTML = `
      <div class="page-enter text-center py-16">
        <h2 class="text-xl font-bold text-content-muted mb-4">Contributeur introuvable</h2>
        <a href="#/contributors" class="text-primary hover:underline">Retour aux contributeurs</a>
      </div>
    `;
    return;
  }

  const rank = profiles.findIndex((p) => p.name === name) + 1;

  container.innerHTML = `
    <div class="page-enter">
      <a href="#/contributors" class="text-sm text-content-muted hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Retour
      </a>

      <!-- Profile header -->
      <div class="glass rounded-xl p-6 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
            ${profile.name.charAt(0)}
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-content">${profile.name}</h1>
            <p class="text-sm text-content-muted">Rang #${rank} · ${profile.count} contributions</p>
            <p class="text-xs text-content-muted mt-1">Du ${formatDate(profile.firstDate)} au ${formatDate(profile.lastDate)}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          ${profile.topTags.map((t) => `<span class="tag-badge">${t.tag} <span class="ml-1 opacity-60">${t.count}</span></span>`).join("")}
        </div>
      </div>

      <!-- Entries -->
      <h2 class="text-lg font-semibold text-content mb-4">Contributions (${profile.count})</h2>
      ${renderCardGrid(profile.entries.slice().reverse())}
    </div>
  `;
}
