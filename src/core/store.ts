import type { AppState, FilterState, SortOption, TechWatchEntry } from "../types.ts";

type Listener = () => void;

const defaultFilters: FilterState = {
  tags: [],
  contributor: "",
  search: "",
  dateFrom: "",
  dateTo: "",
};

const initialState: AppState = {
  entries: [],
  filtered: [],
  allTags: [],
  contributors: [],
  filters: { ...defaultFilters },
  viewMode: "grid",
  sort: "recent",
  loading: true,
  error: null,
};

let state: AppState = { ...initialState };
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function setState(partial: Partial<AppState>): void {
  state = { ...state, ...partial };
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  for (const fn of listeners) {
    fn();
  }
}

export function applyFilters(): void {
  const { entries, filters } = state;
  let result = entries;

  if (filters.tags.length > 0) {
    result = result.filter((e) =>
      filters.tags.some((t) => e.tags.includes(t))
    );
  }

  if (filters.contributor) {
    result = result.filter((e) => e.contributor === filters.contributor);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q) ||
        e.domain.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.dateFrom) {
    const from = parseFilterDate(filters.dateFrom);
    if (from) result = result.filter((e) => e.date >= from);
  }

  if (filters.dateTo) {
    const to = parseFilterDate(filters.dateTo);
    if (to) {
      to.setHours(23, 59, 59, 999);
      result = result.filter((e) => e.date <= to);
    }
  }

  result = sortEntries(result, state.sort);
  setState({ filtered: result });
}

function sortEntries(entries: TechWatchEntry[], sort: SortOption): TechWatchEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    case "oldest":
      return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
    case "alpha":
      return sorted.sort((a, b) => a.subject.localeCompare(b.subject));
    case "contributor":
      return sorted.sort((a, b) => a.contributor.localeCompare(b.contributor));
    case "tags":
      return sorted.sort((a, b) => b.tags.length - a.tags.length);
  }
}

function parseFilterDate(str: string): Date | null {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
