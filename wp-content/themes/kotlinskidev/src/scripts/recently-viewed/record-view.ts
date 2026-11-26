import { readEntries, writeEntries } from "./entry-storage";
import type { RecentlyViewedEntry } from "./entry-types";
import { getMetaContent, getPostId, isExcludedPage } from "./page-info";

const MAX_ENTRIES = 6;

const buildCurrentPageEntry = (): RecentlyViewedEntry => {
  const publishedTime = getMetaContent('meta[property="article:published_time"]');
  const modifiedTime = getMetaContent('meta[property="article:modified_time"]');

  return {
    url: window.location.href,
    title: document.title,
    image: getMetaContent('meta[property="og:image"]'),
    excerpt: getMetaContent('meta[property="og:description"], meta[name="description"]'),
    date: publishedTime || modifiedTime,
    isPage: !document.body.classList.contains("single-post"),
  };
};

export const recordView = (): void => {
  if (isExcludedPage() || !getPostId()) {
    return;
  }

  const entry = buildCurrentPageEntry();
  const entries = readEntries().filter((item) => item.url !== entry.url);
  entries.unshift(entry);
  writeEntries(entries.slice(0, MAX_ENTRIES));
};
