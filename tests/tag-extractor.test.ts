import { describe, it, expect } from "vitest";
import { extractTags, getAllTags } from "../src/data/tag-extractor.ts";

describe("extractTags", () => {
  it("extracts AI-related tags", () => {
    expect(extractTags("Introduction à l'IA générative et LLM")).toContain("AI");
  });

  it("extracts DevOps tags", () => {
    expect(extractTags("Kubernetes best practices for production")).toContain("DevOps");
  });

  it("extracts Security tags", () => {
    expect(extractTags("Sécurité des API et vulnérabilités XDR")).toContain("Security");
  });

  it("extracts multiple tags from one subject", () => {
    const tags = extractTags("Deploy AI models on Kubernetes with Docker");
    expect(tags).toContain("AI");
    expect(tags).toContain("DevOps");
  });

  it("handles multi-word aliases", () => {
    expect(extractTags("Machine learning pour l'analyse de données")).toContain("AI");
  });

  it("returns 'Other' when no tags match", () => {
    expect(extractTags("Lorem ipsum dolor sit amet")).toEqual(["Other"]);
  });

  it("extracts Craft tags from craftsmanship and quality vocabulary", () => {
    expect(extractTags("openapi api test quality craftman")).toContain("Craft");
    expect(extractTags("software craftsmanship principles")).toContain("Craft");
    expect(extractTags("la qualité logicielle au quotidien")).toContain("Craft");
  });

  it("does not tag 'craft beer' as Craft", () => {
    expect(extractTags("événement cybersécurité et craft beer")).not.toContain("Craft");
  });

  it("extracts Events tags", () => {
    expect(extractTags("Calendrier talks et cfp (mondial)")).toContain("Events");
    expect(extractTags("Liste des videos du FOSDEM")).toContain("Events");
  });

  it("matches aliases inside hyphenated tokens", () => {
    expect(extractTags("playwright-mcp")).toContain("AI");
    expect(extractTags("chrome-devtools-mcp")).toContain("AI");
  });

  it("extracts Sovereignty tags", () => {
    expect(extractTags("souveraineté technologique européenne")).toContain("Sovereignty");
    expect(extractTags("indice de résilience numérique")).toContain("Sovereignty");
  });

  it("extracts Hardware tags", () => {
    expect(extractTags("instabilités hardware laptop Framework")).toContain("Hardware");
  });

  it("returns sorted tags", () => {
    const tags = extractTags("Docker et IA pour le cloud");
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
  });

  it("deduplicates tags", () => {
    const tags = extractTags("AI LLM machine learning intelligence artificielle");
    const aiCount = tags.filter((t) => t === "AI").length;
    expect(aiCount).toBe(1);
  });

  it("extracts Green IT tags", () => {
    expect(extractTags("Écoconception et numérique responsable")).toContain("Green IT");
  });

  it("extracts Web tags", () => {
    expect(extractTags("Animation CSS et frontend moderne")).toContain("Web");
  });
});

describe("getAllTags", () => {
  it("returns unique sorted tags from multiple subjects", () => {
    const tags = getAllTags([
      "Docker Kubernetes",
      "IA et machine learning",
      "Sécurité des APIs",
    ]);
    expect(tags).toContain("AI");
    expect(tags).toContain("DevOps");
    expect(tags).toContain("Security");
    // Should be sorted
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
  });

  it("returns empty array for empty input", () => {
    expect(getAllTags([])).toEqual([]);
  });
});
