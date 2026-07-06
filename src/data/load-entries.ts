import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTsvText } from "./parser.ts";
import { siteConfig } from "../config.ts";
import type { TechWatchEntry } from "../types.ts";

/**
 * Replace contributor names with stable pseudonyms ("Contributeur 1..N"),
 * assigned in first-appearance order so the output is deterministic.
 */
function anonymizeContributors(entries: TechWatchEntry[]): TechWatchEntry[] {
  const pseudonyms = new Map<string, string>();
  for (const entry of entries) {
    if (!pseudonyms.has(entry.contributor)) {
      pseudonyms.set(entry.contributor, `Contributeur ${pseudonyms.size + 1}`);
    }
    entry.contributor = pseudonyms.get(entry.contributor)!;
  }
  return entries;
}

/**
 * Load and parse TSV entries at Astro build time.
 * This runs in Node.js during the build, not in the browser.
 * The TSV lives outside public/ on purpose: it contains full contributor
 * names and must never be shipped to the deployed site.
 */
export function loadEntries(): TechWatchEntry[] {
  const tsvPath = resolve("data/tech-watch-v1.tsv");
  const text = readFileSync(tsvPath, "utf-8");
  const entries = parseTsvText(text);
  return siteConfig.anonymizeContributors ? anonymizeContributors(entries) : entries;
}
