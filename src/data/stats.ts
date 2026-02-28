import type {
  TechWatchEntry,
  ContributorProfile,
  TagStat,
  MonthStat,
  DashboardStats,
} from "../types.ts";
import { monthKey, monthLabel } from "../utils/date.ts";

export function computeStats(entries: TechWatchEntry[]): DashboardStats {
  const sorted = [...entries].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return {
    totalEntries: entries.length,
    totalContributors: new Set(entries.map((e) => e.contributor)).size,
    totalTags: new Set(entries.flatMap((e) => e.tags)).size,
    dateRange: {
      from: sorted[0]?.date ?? new Date(),
      to: sorted[sorted.length - 1]?.date ?? new Date(),
    },
    byTag: computeTagStats(entries),
    byContributor: computeContributorProfiles(entries),
    byMonth: computeMonthStats(entries),
  };
}

export function computeTagStats(entries: TechWatchEntry[]): TagStat[] {
  const tagMap = new Map<
    string,
    { count: number; contributors: Set<string>; months: Map<string, number> }
  >();

  for (const entry of entries) {
    const mk = monthKey(entry.date);
    for (const tag of entry.tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { count: 0, contributors: new Set(), months: new Map() });
      }
      const t = tagMap.get(tag)!;
      t.count++;
      t.contributors.add(entry.contributor);
      t.months.set(mk, (t.months.get(mk) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, data]) => {
      const monthKeys = Array.from(data.months.keys()).sort();
      const mid = Math.floor(monthKeys.length / 2);
      const firstHalf = monthKeys
        .slice(0, mid)
        .reduce((s, k) => s + (data.months.get(k) ?? 0), 0);
      const secondHalf = monthKeys
        .slice(mid)
        .reduce((s, k) => s + (data.months.get(k) ?? 0), 0);
      const trend = secondHalf - firstHalf;

      return {
        tag,
        count: data.count,
        contributors: Array.from(data.contributors),
        trend,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function computeContributorProfiles(
  entries: TechWatchEntry[]
): ContributorProfile[] {
  const map = new Map<string, TechWatchEntry[]>();
  for (const entry of entries) {
    if (!map.has(entry.contributor)) map.set(entry.contributor, []);
    map.get(entry.contributor)!.push(entry);
  }

  return Array.from(map.entries())
    .map(([name, items]) => {
      const sorted = [...items].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      const tagCount = new Map<string, number>();
      for (const e of items) {
        for (const t of e.tags) {
          tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
        }
      }
      const topTags = Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        name,
        count: items.length,
        entries: sorted,
        topTags,
        firstDate: sorted[0].date,
        lastDate: sorted[sorted.length - 1].date,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function computeMonthStats(entries: TechWatchEntry[]): MonthStat[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const entry of entries) {
    const key = monthKey(entry.date);
    if (!map.has(key)) {
      map.set(key, { label: monthLabel(entry.date), count: 0 });
    }
    map.get(key)!.count++;
  }

  return Array.from(map.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
