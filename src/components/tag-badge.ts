export function renderTagBadge(
  tag: string,
  active = false,
  clickable = true
): string {
  const cls = `tag-badge${active ? " active" : ""}`;
  if (clickable) {
    return `<button class="${cls}" data-tag="${tag}">${tag}</button>`;
  }
  return `<span class="${cls}">${tag}</span>`;
}

export function renderTagList(
  tags: string[],
  activeTags: string[] = []
): string {
  return tags
    .map((t) => renderTagBadge(t, activeTags.includes(t)))
    .join("");
}
