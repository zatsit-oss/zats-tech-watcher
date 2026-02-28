import { getState, setState, subscribe, applyFilters } from "../core/store.ts";
import { setCleanup } from "../core/router.ts";
import { renderCardGrid } from "../components/card-grid.ts";
import { renderListView } from "../components/list-view.ts";
import { renderViewToggle } from "../components/view-toggle.ts";
import { renderSortMenu } from "../components/sort-menu.ts";
import { renderSurpriseModal, renderSurpriseContent } from "../components/surprise-modal.ts";
import { renderSearchBar } from "../components/search-bar.ts";
import { renderFilters } from "../components/filters.ts";
import { qs } from "../utils/dom.ts";
import { debounce } from "../utils/debounce.ts";
import type { SortOption, ViewMode } from "../types.ts";

export function mountHome(): void {
  const container = qs<HTMLElement>("#page-container");
  if (!container) return;

  const unsub = subscribe(() => render(container));
  render(container);

  setCleanup(() => {
    unsub();
  });
}

function render(container: HTMLElement): void {
  const state = getState();
  const { filtered, viewMode, sort, filters, loading } = state;

  if (loading) {
    container.innerHTML = renderSkeleton();
    return;
  }

  if (state.error) {
    container.innerHTML = renderError(state.error);
    return;
  }

  container.innerHTML = `
    <div class="page-enter">
      <!-- Header section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold gradient-text mb-2">Veille Technologique</h1>
        <p class="text-content-muted text-sm">${filtered.length} ressource${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}</p>
      </div>

      <!-- Search + Sort + View toggle -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        ${renderSearchBar(filters.search)}
        <div class="flex items-center gap-3">
          <button id="discover-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-edge text-sm text-content hover:bg-bg-alt transition-colors" aria-label="Découvrir une ressource au hasard">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            <span class="hidden sm:inline">Découvrir</span>
          </button>
          ${renderSortMenu(sort)}
          ${renderViewToggle(viewMode)}
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        ${renderFilters()}
      </div>

      <!-- Content -->
      <div id="entries-container">
        ${viewMode === "grid" ? renderCardGrid(filtered) : renderListView(filtered)}
      </div>
    </div>
  `;

  bindEvents(container);
}

function bindEvents(container: HTMLElement): void {
  // Search
  const searchInput = qs<HTMLInputElement>("#search-input", container);
  const handleSearch = debounce(() => {
    const val = searchInput?.value ?? "";
    const state = getState();
    setState({ filters: { ...state.filters, search: val } });
    applyFilters();
  }, 250);
  searchInput?.addEventListener("input", handleSearch);

  // View toggle
  container.querySelectorAll(".view-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = (btn as HTMLElement).dataset.view as ViewMode;
      setState({ viewMode: mode });
    });
  });

  // Discover button
  qs("#discover-btn", container)?.addEventListener("click", () => openSurprise());

  // Sort menu
  const sortSelect = qs<HTMLSelectElement>("#sort-select", container);
  sortSelect?.addEventListener("change", () => {
    setState({ sort: sortSelect.value as SortOption });
    applyFilters();
  });

  // Tag filters
  container.querySelectorAll("#tag-filters .tag-badge").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = (btn as HTMLElement).dataset.tag!;
      const state = getState();
      const tags = state.filters.tags.includes(tag)
        ? state.filters.tags.filter((t) => t !== tag)
        : [...state.filters.tags, tag];
      setState({ filters: { ...state.filters, tags } });
      applyFilters();
    });
  });

  // Contributor filter
  const contribSelect = qs<HTMLSelectElement>("#contributor-filter", container);
  contribSelect?.addEventListener("change", () => {
    const state = getState();
    setState({ filters: { ...state.filters, contributor: contribSelect.value } });
    applyFilters();
  });

  // Clear filters
  qs("#clear-filters", container)?.addEventListener("click", () => {
    setState({
      filters: { tags: [], contributor: "", search: "", dateFrom: "", dateTo: "" },
    });
    applyFilters();
  });

  // Tag clicks in cards/list
  container.querySelectorAll("#entries-container .tag-badge").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tag = (btn as HTMLElement).dataset.tag!;
      const state = getState();
      if (!state.filters.tags.includes(tag)) {
        setState({ filters: { ...state.filters, tags: [...state.filters.tags, tag] } });
        applyFilters();
      }
    });
  });
}

function renderError(message: string): string {
  return `
    <div class="glass rounded-xl p-12 text-center page-enter">
      <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>
      <h3 class="text-lg font-semibold text-content mb-2">Erreur de chargement</h3>
      <p class="text-sm text-content-muted">${message}</p>
      <button onclick="location.reload()" class="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">Réessayer</button>
    </div>
  `;
}

function pickRandom(): import("../types.ts").TechWatchEntry | null {
  const { entries } = getState();
  if (entries.length === 0) return null;
  return entries[Math.floor(Math.random() * entries.length)];
}

function openSurprise(): void {
  const entry = pickRandom();
  if (!entry) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderSurpriseModal(entry);
  document.body.appendChild(wrapper.firstElementChild!);

  bindSurpriseEvents();
}

function refreshSurprise(modal: HTMLElement): void {
  const entry = pickRandom();
  if (!entry) return;
  const content = qs<HTMLElement>("#surprise-content", modal);
  if (content) content.innerHTML = renderSurpriseContent(entry);
  const link = modal.querySelector("a[target='_blank']") as HTMLAnchorElement | null;
  if (link) link.href = entry.url;
}

function bindSurpriseEvents(): void {
  const modal = qs<HTMLElement>("#surprise-modal");
  if (!modal) return;

  const close = () => {
    modal.remove();
    document.removeEventListener("keydown", onKey);
  };

  qs("#surprise-close", modal)?.addEventListener("click", close);
  qs("#surprise-overlay", modal)?.addEventListener("click", close);
  qs("#surprise-another", modal)?.addEventListener("click", () => refreshSurprise(modal));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
}

function renderSkeleton(): string {
  const cards = Array.from({ length: 6 })
    .map(
      () => `<div class="skeleton h-48 rounded-xl"></div>`
    )
    .join("");
  return `
    <div class="mb-8">
      <div class="skeleton h-10 w-64 mb-2"></div>
      <div class="skeleton h-5 w-32"></div>
    </div>
    <div class="skeleton h-10 w-full max-w-md mb-6"></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${cards}
    </div>
  `;
}
