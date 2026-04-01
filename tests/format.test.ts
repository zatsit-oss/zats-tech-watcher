import { describe, it, expect } from "vitest";
import { truncate, formatNumber, extractDomain, capitalize } from "../src/utils/format.ts";

describe("truncate", () => {
  it("returns string unchanged if shorter than max", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when longer than max", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });

  it("returns exact length string unchanged", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });
});

describe("formatNumber", () => {
  it("formats with French locale separator", () => {
    const result = formatNumber(1234);
    // French locale uses non-breaking space as thousands separator
    expect(result.replace(/\s/g, " ")).toContain("1");
    expect(result.replace(/\s/g, " ")).toContain("234");
  });

  it("formats small numbers unchanged", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("extractDomain", () => {
  it("extracts domain from URL", () => {
    expect(extractDomain("https://blog.zatsit.fr/article")).toBe("blog.zatsit.fr");
  });

  it("strips www prefix", () => {
    expect(extractDomain("https://www.github.com/repo")).toBe("github.com");
  });

  it("returns original string for invalid URL", () => {
    expect(extractDomain("not-a-url")).toBe("not-a-url");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("does not change already capitalized", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });
});
