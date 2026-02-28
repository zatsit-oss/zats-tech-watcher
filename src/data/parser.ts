import type { TechWatchEntry } from "../types.ts";
import { parseFrenchDate } from "../utils/date.ts";
import { extractDomain } from "../utils/format.ts";
import { extractTags } from "./tag-extractor.ts";

export async function fetchAndParse(): Promise<TechWatchEntry[]> {
  const response = await fetch("/tech-watch-v1.tsv");
  if (!response.ok) throw new Error(`Failed to fetch TSV: ${response.status}`);
  const text = await response.text();
  return parseTsv(text);
}

function parseTsv(text: string): TechWatchEntry[] {
  const lines = text.trim().split("\n");
  // Skip header
  const entries: TechWatchEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split("\t");
    const dateStr = cols[0]?.trim() ?? "";
    const contributor = cols[1]?.trim() ?? "";
    const subject = cols[2]?.trim() ?? "";
    const url = cols[3]?.trim() ?? "";

    if (!dateStr || !contributor || !url) continue;

    const date = parseFrenchDate(dateStr);
    const domain = extractDomain(url);
    const tags = extractTags(subject);

    entries.push({
      id: i,
      date,
      dateStr,
      contributor,
      subject,
      url,
      domain,
      tags,
    });
  }

  // Sort by date descending (newest first)
  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return entries;
}
