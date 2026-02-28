export interface BarChartData {
  label: string;
  value: number;
}

export function renderBarChart(
  data: BarChartData[],
  width = 600,
  height = 300
): string {
  if (data.length === 0) return "";

  const maxVal = Math.max(...data.map((d) => d.value));
  const barWidth = Math.min(40, (width - 60) / data.length - 4);
  const chartH = height - 50;
  const startX = 50;

  const bars = data
    .map((d, i) => {
      const barH = (d.value / maxVal) * chartH;
      const x = startX + i * (barWidth + 4);
      const y = chartH - barH + 10;
      return `
        <g class="chart-bar" data-label="${d.label}" data-value="${d.value}">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="var(--color-primary)" opacity="0.8">
            <animate attributeName="height" from="0" to="${barH}" dur="0.5s" fill="freeze"/>
            <animate attributeName="y" from="${chartH + 10}" to="${y}" dur="0.5s" fill="freeze"/>
          </rect>
          <text x="${x + barWidth / 2}" y="${chartH + 25}" text-anchor="middle" font-size="9" fill="var(--color-content-muted)" transform="rotate(-45, ${x + barWidth / 2}, ${chartH + 25})">${d.label.length > 8 ? d.label.slice(0, 8) + "…" : d.label}</text>
          <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--color-content)">${d.value}</text>
        </g>
      `;
    })
    .join("");

  // Y-axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const val = Math.round((maxVal / 4) * i);
    const y = chartH - (val / maxVal) * chartH + 10;
    return `
      <text x="42" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--color-content-muted)">${val}</text>
      <line x1="46" y1="${y}" x2="${width}" y2="${y}" stroke="var(--color-edge-solid)" stroke-width="0.5" stroke-dasharray="4"/>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full" style="max-height: ${height}px">
      ${yLabels}
      ${bars}
    </svg>
  `;
}
