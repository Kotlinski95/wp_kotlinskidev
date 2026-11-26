import { buildCard } from "./card";
import { readEntries } from "./entry-storage";

const CONTAINER_ID = "kt-recently-viewed";
const GRID_SELECTOR = ".kt-post-card-grid";

export const renderRecentlyViewed = (): void => {
  const container = document.getElementById(CONTAINER_ID);
  const grid = container?.querySelector(GRID_SELECTOR);
  if (!container || !grid) {
    return;
  }

  const entries = readEntries().filter((entry) => entry.url !== window.location.href);
  if (entries.length === 0) {
    return;
  }

  entries.forEach((entry) => grid.appendChild(buildCard(entry)));
  container.removeAttribute("hidden");
};
