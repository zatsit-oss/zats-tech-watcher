export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

const COLORS = [
  "#0f15fd", "#f1be51", "#e1601f", "#10b981", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#84cc16", "#ef4444", "#a855f7", "#22d3ee",
];

export function renderDonutChart(
  data: DonutChartData[],
  size = 250
): string {
  if (data.length === 0) return "";

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const innerRadius = radius * 0.6;

  let currentAngle = -90;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = angle > 180 ? 1 : 0;
    const color = d.color ?? COLORS[i % COLORS.length];

    const path = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");

    return `<path d="${path}" fill="${color}" opacity="0.85" stroke="var(--color-bg)" stroke-width="2">
      <title>${d.label}: ${d.value} (${Math.round((d.value / total) * 100)}%)</title>
    </path>`;
  });

  // Legend
  const legend = data
    .slice(0, 8)
    .map((d, i) => {
      const color = d.color ?? COLORS[i % COLORS.length];
      const pct = Math.round((d.value / total) * 100);
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-3 h-3 rounded-sm shrink-0" style="background:${color}"></span>
          <span class="text-content truncate">${d.label}</span>
          <span class="text-content-muted ml-auto">${pct}%</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 ${size} ${size}" class="w-full max-w-[200px] shrink-0">
        ${slices.join("")}
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--color-content)">${total}</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="10" fill="var(--color-content-muted)">total</text>
      </svg>
      <div class="flex flex-col gap-2 min-w-[140px]">${legend}</div>
    </div>
  `;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
