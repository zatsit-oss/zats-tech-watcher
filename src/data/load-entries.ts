import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTsvText } from "./parser.ts";
import type { TechWatchEntry } from "../types.ts";

/**
 * Load and parse TSV entries at Astro build time.
 * This runs in Node.js during the build, not in the browser.
 */
export function loadEntries(): TechWatchEntry[] {
  const tsvPath = resolve("public/tech-watch-v1.tsv");
  const text = readFileSync(tsvPath, "utf-8");
  return parseTsvText(text);
}
