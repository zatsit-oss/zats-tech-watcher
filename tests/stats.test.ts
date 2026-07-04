import { describe, it, expect } from "vitest";
import {
  computeStats,
  computeTagStats,
  computeContributorProfiles,
  computeMonthStats,
} from "../src/data/stats.ts";
import type { TechWatchEntry } from "../src/types.ts";

function makeEntry(overrides: Partial<TechWatchEntry> = {}): TechWatchEntry {
  return {
    id: 1,
    date: new Date(2025, 2, 15),
    dateStr: "15/03/2025",
    contributor: "John Doe",
    subject: "Test subject",
    url: "https://example.com",
    domain: "example.com",
    tags: ["AI"],
    ...overrides,
  };
}

const sampleEntries: TechWatchEntry[] = [
  makeEntry({ id: 1, contributor: "Alice", tags: ["AI", "DevOps"], date: new Date(2025, 0, 10) }),
  makeEntry({ id: 2, contributor: "Alice", tags: ["AI"], date: new Date(2025, 0, 20) }),
  makeEntry({ id: 3, contributor: "Bob", tags: ["Security"], date: new Date(2025, 1, 5) }),
  makeEntry({ id: 4, contributor: "Bob", tags: ["DevOps", "Cloud"], date: new Date(2025, 1, 15) }),
  makeEntry({ id: 5, contributor: "Alice", tags: ["AI", "Web"], date: new Date(2025, 2, 1) }),
];

describe("computeStats", () => {
  it("computes total entries", () => {
    const stats = computeStats(sampleEntries);
    expect(stats.totalEntries).toBe(5);
  });

  it("computes total contributors", () => {
    const stats = computeStats(sampleEntries);
    expect(stats.totalContributors).toBe(2);
  });

  it("computes total unique tags", () => {
    const stats = computeStats(sampleEntries);
    expect(stats.totalTags).toBe(5); // AI, DevOps, Security, Cloud, Web
  });

  it("computes date range", () => {
    const stats = computeStats(sampleEntries);
    expect(stats.dateRange.from.getMonth()).toBe(0); // January
    expect(stats.dateRange.to.getMonth()).toBe(2); // March
  });

  it("includes byTag, byContributor, byMonth", () => {
    const stats = computeStats(sampleEntries);
    expect(stats.byTag.length).toBeGreaterThan(0);
    expect(stats.byContributor.length).toBe(2);
    expect(stats.byMonth.length).toBeGreaterThan(0);
  });
});

describe("computeTagStats", () => {
  it("counts tag occurrences", () => {
    const tagStats = computeTagStats(sampleEntries);
    const ai = tagStats.find((t) => t.tag === "AI");
    expect(ai?.count).toBe(3);
  });

  it("tracks contributors per tag", () => {
    const tagStats = computeTagStats(sampleEntries);
    const devops = tagStats.find((t) => t.tag === "DevOps");
    expect(devops?.contributors).toContain("Alice");
    expect(devops?.contributors).toContain("Bob");
  });

  it("sorts by count descending", () => {
    const tagStats = computeTagStats(sampleEntries);
    for (let i = 1; i < tagStats.length; i++) {
      expect(tagStats[i - 1].count).toBeGreaterThanOrEqual(tagStats[i].count);
    }
  });

  it("computes trend", () => {
    const tagStats = computeTagStats(sampleEntries);
    const ai = tagStats.find((t) => t.tag === "AI");
    expect(ai?.trend).toBeDefined();
    expect(typeof ai?.trend).toBe("number");
  });
});

describe("computeContributorProfiles", () => {
  it("groups entries by contributor", () => {
    const profiles = computeContributorProfiles(sampleEntries);
    const alice = profiles.find((p) => p.name === "Alice");
    expect(alice?.count).toBe(3);
    expect(alice?.entries).toHaveLength(3);
  });

  it("sorts by count descending", () => {
    const profiles = computeContributorProfiles(sampleEntries);
    expect(profiles[0].name).toBe("Alice"); // 3 entries
    expect(profiles[1].name).toBe("Bob"); // 2 entries
  });

  it("computes top tags per contributor", () => {
    const profiles = computeContributorProfiles(sampleEntries);
    const alice = profiles.find((p) => p.name === "Alice");
    expect(alice?.topTags[0].tag).toBe("AI"); // 3 occurrences
  });

  it("computes date range per contributor", () => {
    const profiles = computeContributorProfiles(sampleEntries);
    const alice = profiles.find((p) => p.name === "Alice");
    expect(alice?.firstDate.getMonth()).toBe(0);
    expect(alice?.lastDate.getMonth()).toBe(2);
  });
});

describe("computeMonthStats", () => {
  it("groups entries by month", () => {
    const months = computeMonthStats(sampleEntries);
    expect(months.length).toBe(3); // Jan, Feb, Mar
  });

  it("sorts by month ascending", () => {
    const months = computeMonthStats(sampleEntries);
    expect(months[0].month).toBe("2025-01");
    expect(months[2].month).toBe("2025-03");
  });

  it("counts entries per month", () => {
    const months = computeMonthStats(sampleEntries);
    const jan = months.find((m) => m.month === "2025-01");
    expect(jan?.count).toBe(2);
  });

  it("generates readable labels", () => {
    const months = computeMonthStats(sampleEntries);
    expect(months[0].label).toBe("Jan 2025");
  });
});
