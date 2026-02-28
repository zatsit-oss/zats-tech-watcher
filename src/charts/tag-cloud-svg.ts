export interface TagCloudItem {
  tag: string;
  count: number;
  trend: number;
}

export function renderTagCloudSvg(
  items: TagCloudItem[],
  width = 600,
  height = 400
): string {
  if (items.length === 0) return "";

  const maxCount = Math.max(...items.map((i) => i.count));
  const minCount = Math.min(...items.map((i) => i.count));

  const cx = width / 2;
  const cy = height / 2;

  // Spiral placement
  const placed: { tag: string; x: number; y: number; size: number; count: number; trend: number }[] = [];

  const sorted = [...items].sort((a, b) => b.count - a.count);

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const ratio = maxCount === minCount ? 0.5 : (item.count - minCount) / (maxCount - minCount);
    const size = 12 + ratio * 24;

    // Spiral outward
    let angle = i * 0.7;
    let radius = 0;
    let x = cx;
    let y = cy;
    let attempts = 0;

    while (attempts < 200) {
      x = cx + radius * Math.cos(angle);
      y = cy + radius * Math.sin(angle);

      // Check bounds
      const textW = item.tag.length * size * 0.6;
      if (
        x - textW / 2 > 10 &&
        x + textW / 2 < width - 10 &&
        y - size / 2 > 10 &&
        y + size / 2 < height - 10 &&
        !hasCollision(placed, x, y, textW, size)
      ) {
        break;
      }

      angle += 0.3;
      radius += 1.5;
      attempts++;
    }

    placed.push({ tag: item.tag, x, y, size, count: item.count, trend: item.trend });
  }

  const texts = placed
    .map((p) => {
      const opacity = 0.5 + (p.size - 12) / 48;
      const trendColor = p.trend > 0 ? "var(--color-primary)" : "var(--color-content)";
      return `
        <text
          x="${p.x}" y="${p.y}"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="${p.size}"
          font-weight="${p.size > 24 ? "700" : p.size > 18 ? "600" : "500"}"
          fill="${trendColor}"
          opacity="${opacity}"
          class="cursor-pointer hover:opacity-100 transition-opacity"
          data-tag="${p.tag}"
        >${p.tag}<title>${p.tag}: ${p.count} entries (trend: ${p.trend > 0 ? "+" : ""}${p.trend})</title></text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full" style="max-height: ${height}px">
      ${texts}
    </svg>
  `;
}

function hasCollision(
  placed: { x: number; y: number; size: number; tag: string }[],
  x: number,
  y: number,
  w: number,
  h: number
): boolean {
  for (const p of placed) {
    const pw = p.tag.length * p.size * 0.6;
    const ph = p.size;
    if (
      Math.abs(x - p.x) < (w + pw) / 2 + 4 &&
      Math.abs(y - p.y) < (h + ph) / 2 + 2
    ) {
      return true;
    }
  }
  return false;
}
