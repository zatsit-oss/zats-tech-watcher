import "./style.css";
import { renderLayout } from "./components/layout.ts";
import { initHeader } from "./components/header.ts";
import { registerRoute, startRouter } from "./core/router.ts";
import { setState } from "./core/store.ts";
import { fetchAndParse } from "./data/parser.ts";
import { mountHome } from "./pages/home.ts";
import { mountContributors } from "./pages/contributors.ts";
import { mountContributorDetail } from "./pages/contributor-detail.ts";
import { mountTimeline } from "./pages/timeline.ts";
import { mountStatsDashboard } from "./pages/stats-dashboard.ts";
import { mountTagCloud } from "./pages/tag-cloud.ts";
import { mountActivity } from "./pages/activity.ts";

async function init(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = renderLayout();
  initHeader();

  // Register routes
  registerRoute("/", () => mountHome());
  registerRoute("/contributors", () => mountContributors());
  registerRoute("/contributors/:name", (params) =>
    mountContributorDetail(params.name)
  );
  registerRoute("/timeline", () => mountTimeline());
  registerRoute("/stats", () => mountStatsDashboard());
  registerRoute("/tags", () => mountTagCloud());
  registerRoute("/activity", () => mountActivity());

  // Fetch data
  try {
    const entries = await fetchAndParse();
    const allTags = [...new Set(entries.flatMap((e) => e.tags))].sort();
    const contributors = [...new Set(entries.map((e) => e.contributor))].sort();

    setState({
      entries,
      filtered: entries,
      allTags,
      contributors,
      loading: false,
    });
  } catch (err) {
    setState({
      loading: false,
      error: err instanceof Error ? err.message : "Failed to load data, please check the data file.",
    });
  }

  // Start router
  startRouter();
}

init();
