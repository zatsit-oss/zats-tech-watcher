export interface TechWatchEntry {
  id: number;
  date: Date;
  dateStr: string;
  contributor: string;
  subject: string;
  url: string;
  domain: string;
  tags: string[];
  /** Optional contributor note explaining why the resource is worth reading */
  comment: string;
}

export interface ContributorProfile {
  name: string;
  count: number;
  entries: TechWatchEntry[];
  topTags: { tag: string; count: number }[];
  firstDate: Date;
  lastDate: Date;
}

export interface TagStat {
  tag: string;
  count: number;
  contributors: string[];
  trend: number; // positive = growing
}

export interface MonthStat {
  month: string; // YYYY-MM
  label: string; // "Jan 2025"
  count: number;
}

export interface DashboardStats {
  totalEntries: number;
  totalContributors: number;
  totalTags: number;
  dateRange: { from: Date; to: Date };
  byTag: TagStat[];
  byContributor: ContributorProfile[];
  byMonth: MonthStat[];
}

export interface FilterState {
  tags: string[];
  contributor: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export type ViewMode = "grid" | "list";

export type SortOption = "recent" | "oldest" | "alpha" | "contributor" | "tags";

export interface AppState {
  entries: TechWatchEntry[];
  filtered: TechWatchEntry[];
  allTags: string[];
  contributors: string[];
  filters: FilterState;
  viewMode: ViewMode;
  sort: SortOption;
  loading: boolean;
  error: string | null;
}
