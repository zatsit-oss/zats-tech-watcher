import { describe, it, expect } from "vitest";
import { parseTsvText } from "../src/data/parser.ts";

const SAMPLE_TSV = `Date\tContributeur\tSujet\tURL
15/03/2025\tJohn Doe\tIntroduction à Kubernetes\thttps://blog.example.com/k8s
10/03/2025\tJane Smith\tIA et machine learning en 2025\thttps://ai.example.com/ml
20/03/2025\tJohn Doe\tSécurité des APIs REST\thttps://sec.example.com/api`;

describe("parseTsvText", () => {
  it("parses TSV text into entries", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    expect(entries).toHaveLength(3);
  });

  it("sorts entries by date descending (newest first)", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    expect(entries[0].dateStr).toBe("20/03/2025");
    expect(entries[2].dateStr).toBe("10/03/2025");
  });

  it("extracts contributor name", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    const names = entries.map((e) => e.contributor);
    expect(names).toContain("John D.");
    expect(names).toContain("Jane S.");
  });

  it("extracts domain from URL", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    const domains = entries.map((e) => e.domain);
    expect(domains).toContain("blog.example.com");
    expect(domains).toContain("ai.example.com");
  });

  it("extracts tags from subject", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    const k8sEntry = entries.find((e) => e.subject.includes("Kubernetes"));
    expect(k8sEntry?.tags).toContain("DevOps");
  });

  it("assigns incremental IDs", () => {
    const entries = parseTsvText(SAMPLE_TSV);
    const ids = entries.map((e) => e.id);
    expect(ids.length).toBe(3);
    // IDs should all be unique
    expect(new Set(ids).size).toBe(3);
  });

  it("skips empty lines", () => {
    const tsv = `Date\tContributeur\tSujet\tURL
15/03/2025\tJohn\tTest\thttps://example.com

10/03/2025\tJane\tTest2\thttps://example.com`;
    const entries = parseTsvText(tsv);
    expect(entries).toHaveLength(2);
  });

  it("skips lines with missing required fields", () => {
    const tsv = `Date\tContributeur\tSujet\tURL
15/03/2025\tJohn\tTest\thttps://example.com
\tJane\tMissing date\thttps://example.com
10/03/2025\t\tMissing contributor\thttps://example.com`;
    const entries = parseTsvText(tsv);
    expect(entries).toHaveLength(1);
  });

  it("returns empty array for header-only TSV", () => {
    const entries = parseTsvText("Date\tContributeur\tSujet\tURL");
    expect(entries).toHaveLength(0);
  });
});
