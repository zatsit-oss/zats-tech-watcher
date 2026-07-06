/** Raw feature flags — edit these */
const flags = {
  /**
   * Anonymize contributors at build time: names are replaced by stable
   * pseudonyms ("Contributeur 1..N") in the loaded data, and the contributor
   * ranking pages are not built.
   */
  anonymizeContributors: true,
  /** Show the contributor ranking/leaderboard page and profile links */
  showRanking: true,
};

/** Site-wide feature flags (showRanking is forced off when contributors are anonymized) */
export const siteConfig = {
  ...flags,
  showRanking: flags.showRanking && !flags.anonymizeContributors,
};
