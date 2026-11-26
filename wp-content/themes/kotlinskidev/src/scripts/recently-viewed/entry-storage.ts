import type { RecentlyViewedEntry } from "./entry-types";

const STORAGE_KEY = "kt_recently_viewed_v2";

export const readEntries = (): RecentlyViewedEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedEntry[]) : [];
  } catch {
    return [];
  }
};

export const writeEntries = (entries: RecentlyViewedEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
};
