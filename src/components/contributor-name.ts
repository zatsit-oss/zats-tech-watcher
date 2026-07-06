import { siteConfig } from "../config.ts";
import { escapeHtml } from "../utils/format.ts";

/**
 * Contributor name rendered as a profile link, or as plain text when the
 * ranking is disabled. The `contributor-name` class is the extraction
 * contract used by the home page client script - every contributor surface
 * must go through this helper.
 */
export function renderContributorName(name: string, extraClasses = "text-xs"): string {
  return siteConfig.showRanking
    ? `<a href="/contributors/${encodeURIComponent(name)}/" class="contributor-name ${extraClasses} text-primary hover:underline">${escapeHtml(name)}</a>`
    : `<span class="contributor-name ${extraClasses} text-content-muted">${escapeHtml(name)}</span>`;
}
