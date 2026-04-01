import { describe, it, expect } from "vitest";
import {
  parseFrenchDate,
  formatDate,
  monthLabel,
  monthKey,
  weekKey,
  groupByDate,
} from "../src/utils/date.ts";

describe("parseFrenchDate", () => {
  it("parses DD/MM/YYYY correctly", () => {
    const d = parseFrenchDate("15/03/2025");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(15);
  });

  it("parses first day of year", () => {
    const d = parseFrenchDate("01/01/2024");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });

  it("parses last day of year", () => {
    const d = parseFrenchDate("31/12/2025");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });
});

describe("formatDate", () => {
  it("formats Date to DD/MM/YYYY", () => {
    const d = new Date(2025, 2, 15); // March 15
    expect(formatDate(d)).toBe("15/03/2025");
  });

  it("pads single digits", () => {
    const d = new Date(2025, 0, 5); // Jan 5
    expect(formatDate(d)).toBe("05/01/2025");
  });
});

describe("monthLabel", () => {
  it("returns French abbreviated month + year", () => {
    expect(monthLabel(new Date(2025, 0, 1))).toBe("Jan 2025");
    expect(monthLabel(new Date(2025, 1, 1))).toBe("Fév 2025");
    expect(monthLabel(new Date(2025, 11, 1))).toBe("Déc 2025");
  });
});

describe("monthKey", () => {
  it("returns YYYY-MM format", () => {
    expect(monthKey(new Date(2025, 0, 15))).toBe("2025-01");
    expect(monthKey(new Date(2025, 11, 1))).toBe("2025-12");
  });
});

describe("weekKey", () => {
  it("returns YYYY-Wnn format", () => {
    const key = weekKey(new Date(2025, 0, 6)); // Monday Jan 6
    expect(key).toMatch(/^2025-W\d{2}$/);
  });
});

describe("groupByDate", () => {
  it("groups items by a date key function", () => {
    const items = [
      { d: new Date(2025, 0, 15), v: "a" },
      { d: new Date(2025, 0, 20), v: "b" },
      { d: new Date(2025, 1, 5), v: "c" },
    ];
    const groups = groupByDate(items, (i) => i.d, monthKey);
    expect(groups.size).toBe(2);
    expect(groups.get("2025-01")?.length).toBe(2);
    expect(groups.get("2025-02")?.length).toBe(1);
  });

  it("returns empty map for empty input", () => {
    const groups = groupByDate([], (i: { d: Date }) => i.d, monthKey);
    expect(groups.size).toBe(0);
  });
});
