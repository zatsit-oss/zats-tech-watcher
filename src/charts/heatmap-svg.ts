export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const CELL_SIZE = 12;
const GAP = 2;
const STEP = CELL_SIZE + GAP;
const LABEL_LEFT = 20;
const LABEL_TOP = 16;

function intensityFill(count: number): string {
  if (count === 0) return "var(--color-bg-alt)";
  if (count === 1) return "color-mix(in srgb, var(--color-primary) 25%, transparent)";
  if (count === 2) return "color-mix(in srgb, var(--color-primary) 50%, transparent)";
  if (count === 3) return "color-mix(in srgb, var(--color-primary) 75%, transparent)";
  return "var(--color-primary)";
}

function formatTooltipDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function renderHeatmapSvg(data: DayActivity[]): string {
  const map = new Map<string, number>();
  for (const d of data) {
    map.set(d.date, d.count);
  }

  // Determine date range: last 52 weeks from today-ish or from data range
  const allDates = data.map((d) => new Date(d.date)).filter((d) => !isNaN(d.getTime()));
  if (allDates.length === 0) return "<p class='text-content-muted text-sm'>Aucune donnée</p>";

  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  // Start from ~52 weeks before the max date, aligned to Monday
  const startDate = new Date(maxDate);
  startDate.setDate(startDate.getDate() - 364);
  // Align to Monday
  const dayOfWeek = (startDate.getDay() + 6) % 7; // 0=Mon
  startDate.setDate(startDate.getDate() - dayOfWeek);

  // Build grid
  const cells: { x: number; y: number; date: string; count: number }[] = [];
  const monthMarkers: { x: number; label: string }[] = [];
  let lastMonth = -1;
  let col = 0;

  const cursor = new Date(startDate);
  while (cursor <= maxDate) {
    const row = (cursor.getDay() + 6) % 7; // 0=Mon, 6=Sun
    if (row === 0 && col > 0) col++;
    if (row === 0) {
      // Check for new month
      if (cursor.getMonth() !== lastMonth) {
        lastMonth = cursor.getMonth();
        monthMarkers.push({ x: col, label: MONTH_LABELS[lastMonth] });
      }
    }

    const key = cursor.toISOString().slice(0, 10);
    cells.push({
      x: col,
      y: row,
      date: key,
      count: map.get(key) ?? 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // Actually, the column logic above is wrong. Let me redo it properly.
  // Each column is a week. Column index = week number from start.
  const cellsFixed: { x: number; y: number; date: string; count: number }[] = [];
  const monthMarkersFixed: { x: number; label: string }[] = [];
  let prevMonth = -1;

  const cur = new Date(startDate);
  while (cur <= maxDate) {
    const daysSinceStart = Math.round((cur.getTime() - startDate.getTime()) / 86400000);
    const weekCol = Math.floor(daysSinceStart / 7);
    const dayRow = (cur.getDay() + 6) % 7; // 0=Mon

    const key = cur.toISOString().slice(0, 10);
    cellsFixed.push({
      x: weekCol,
      y: dayRow,
      date: key,
      count: map.get(key) ?? 0,
    });

    if (dayRow === 0 && cur.getMonth() !== prevMonth) {
      prevMonth = cur.getMonth();
      monthMarkersFixed.push({ x: weekCol, label: MONTH_LABELS[prevMonth] });
    }

    cur.setDate(cur.getDate() + 1);
  }

  const totalCols = Math.ceil(((maxDate.getTime() - startDate.getTime()) / 86400000 + 1) / 7);
  const svgWidth = LABEL_LEFT + totalCols * STEP + 4;
  const svgHeight = LABEL_TOP + 7 * STEP + 4;

  const monthLabelsHtml = monthMarkersFixed
    .map(
      (m) =>
        `<text x="${LABEL_LEFT + m.x * STEP}" y="10" class="fill-content-muted" style="font-size:10px">${m.label}</text>`
    )
    .join("");

  const dayLabelsHtml = [0, 2, 4]
    .map(
      (i) =>
        `<text x="0" y="${LABEL_TOP + i * STEP + CELL_SIZE - 2}" class="fill-content-muted" style="font-size:10px">${DAY_LABELS[i]}</text>`
    )
    .join("");

  const rectsHtml = cellsFixed
    .map(
      (c) =>
        `<rect x="${LABEL_LEFT + c.x * STEP}" y="${LABEL_TOP + c.y * STEP}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${intensityFill(c.count)}"><title>${formatTooltipDate(c.date)} : ${c.count} contribution${c.count > 1 ? "s" : ""}</title></rect>`
    )
    .join("");

  return `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto" role="img" aria-label="Calendrier d'activité">${monthLabelsHtml}${dayLabelsHtml}${rectsHtml}</svg>`;
}
