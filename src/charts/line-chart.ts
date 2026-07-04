export interface LineChartData {
  label: string;
  value: number;
}

export function renderLineChart(
  data: LineChartData[],
  width = 600,
  height = 250
): string {
  if (data.length < 2) return "";

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = height - 50;
  const startX = 50;
  const endX = width - 20;
  const stepX = (endX - startX) / (data.length - 1);

  const points = data.map((d, i) => ({
    x: startX + i * stepX,
    y: chartH - (d.value / maxVal) * chartH + 10,
    label: d.label,
    value: d.value,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartH + 10} L ${points[0].x} ${chartH + 10} Z`;

  const dots = points
    .map(
      (p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--color-primary)" stroke="var(--color-bg)" stroke-width="2"/>
    `
    )
    .join("");

  const labels = points
    .filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1)
    .map(
      (p) => `
      <text x="${p.x}" y="${chartH + 25}" text-anchor="middle" font-size="9" fill="var(--color-content-muted)">${p.label}</text>
    `
    )
    .join("");

  const valueLabels = points
    .map(
      (p) => `
      <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="9" font-weight="600" fill="var(--color-content)">${p.value}</text>
    `
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full" style="max-height: ${height}px" role="img" aria-label="Graphique en ligne">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#areaGrad)"/>
      <path d="${pathD}" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <animate attributeName="stroke-dasharray" from="0 ${width * 2}" to="${width * 2} 0" dur="1s"/>
      </path>
      ${dots}
      ${labels}
      ${valueLabels}
    </svg>
  `;
}
