import type { SortOption } from "../types.ts";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Plus récent" },
  { value: "oldest", label: "Plus ancien" },
  { value: "alpha", label: "A-Z sujet" },
  { value: "contributor", label: "Contributeur" },
  { value: "tags", label: "Nb. de tags" },
];

export function renderSortMenu(current: SortOption): string {
  const options = SORT_OPTIONS.map(
    (o) =>
      `<option value="${o.value}"${o.value === current ? " selected" : ""}>${o.label}</option>`
  ).join("");

  return `
    <div class="flex items-center gap-2">
      <label for="sort-select" class="text-xs text-content-muted whitespace-nowrap">Trier :</label>
      <select id="sort-select" class="glass border border-edge text-content bg-transparent text-sm rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary">
        ${options}
      </select>
    </div>
  `;
}
