#!/usr/bin/env node
/**
 * Download the tech watch Google Sheet and normalize it into
 * public/tech-watch-v1.tsv: canonical English header, LF line endings,
 * exactly 6 columns per row, invalid rows skipped with a warning.
 *
 * Remote mode (default) — requires env vars:
 *   SHEET_ID              spreadsheet id (from the sheet URL)
 *   GOOGLE_SHEETS_SA_KEY  service account key JSON (share the sheet with its client_email)
 *   SHEET_RANGE           optional A1 range, default "A:F" (e.g. "Feuille 1!A:F")
 *
 * Local mode (normalize an existing export, no network):
 *   node scripts/sync-tech-watch-data.mjs --from-file path/to/export.tsv
 */
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = fileURLToPath(new URL("../public/tech-watch-v1.tsv", import.meta.url));
const CANONICAL_HEADER = ["Date", "Contributors", "Topics", "Links", "Tags", "Comment"];
const COLUMN_COUNT = CANONICAL_HEADER.length;
const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(serviceAccount.private_key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

async function fetchSheetRows() {
  const sheetId = process.env.SHEET_ID;
  const saKey = process.env.GOOGLE_SHEETS_SA_KEY;
  if (!sheetId || !saKey) {
    console.error("SHEET_ID and GOOGLE_SHEETS_SA_KEY env vars are required (or use --from-file <path>)");
    process.exit(1);
  }
  const range = process.env.SHEET_RANGE ?? "A:F";
  const token = await getAccessToken(JSON.parse(saKey));
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Sheets API request failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).values ?? [];
}

function readLocalRows(path) {
  if (!path) {
    console.error("--from-file requires a path argument");
    process.exit(1);
  }
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.split("\t"));
}

/** Collapse tabs/newlines inside a cell so it cannot break the TSV structure */
function cleanCell(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function normalize(rows) {
  const entries = [];
  const rejected = [];

  rows.forEach((raw, index) => {
    const cells = Array.from({ length: COLUMN_COUNT }, (_, i) => cleanCell(raw[i]));
    const [date, contributor, , link] = cells;

    if (cells.every((cell) => cell === "")) return;
    if (index === 0 && !DATE_RE.test(date)) return; // header row, replaced by CANONICAL_HEADER
    if (!DATE_RE.test(date)) {
      rejected.push(`row ${index + 1}: invalid date "${date}"`);
      return;
    }
    if (!contributor) {
      rejected.push(`row ${index + 1}: missing contributor`);
      return;
    }
    if (!/^https?:\/\//.test(link)) {
      rejected.push(`row ${index + 1}: invalid link "${link}"`);
      return;
    }
    entries.push(cells);
  });

  return { entries, rejected };
}

const fromFileIndex = process.argv.indexOf("--from-file");
const rows = fromFileIndex !== -1 ? readLocalRows(process.argv[fromFileIndex + 1]) : await fetchSheetRows();

const { entries, rejected } = normalize(rows);

if (rejected.length > 0) {
  console.warn(`Skipped ${rejected.length} invalid row(s):`);
  for (const reason of rejected) console.warn(`  - ${reason}`);
}
if (entries.length === 0) {
  console.error("No valid entries produced — aborting without writing.");
  process.exit(1);
}

const tsv = [CANONICAL_HEADER, ...entries].map((cells) => cells.join("\t")).join("\n") + "\n";
writeFileSync(OUTPUT_PATH, tsv);
console.log(`Wrote ${entries.length} entries to ${OUTPUT_PATH}`);
