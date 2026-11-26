export const readNavigationType = (): string => {
  const entries = performance.getEntriesByType("navigation");
  if (entries.length > 0 && entries[0] instanceof PerformanceNavigationTiming) {
    return entries[0].type;
  }
  return "navigate";
};

export const isHistoryOrReloadNavigation = (navigationType: string): boolean =>
  navigationType === "back_forward" || navigationType === "reload";
