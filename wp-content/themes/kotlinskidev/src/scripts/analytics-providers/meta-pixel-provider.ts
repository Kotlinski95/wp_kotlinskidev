import type { AnalyticsProvider } from "./types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STANDARD_EVENT_NAMES: Record<string, string> = {
  generate_lead: "Lead",
  page_view: "PageView",
  search: "Search",
};

export const metaPixelProvider: AnalyticsProvider = {
  id: "meta",
  isReady: () => typeof window.fbq === "function",
  send: (eventName, params) => {
    const standardName = STANDARD_EVENT_NAMES[eventName];
    if (standardName) {
      window.fbq?.("track", standardName, params);
    } else {
      window.fbq?.("trackCustom", eventName, params);
    }
  },
};
