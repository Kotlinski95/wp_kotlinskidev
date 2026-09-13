import type { AnalyticsProvider } from "./types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const gtagProvider: AnalyticsProvider = {
  id: "gtag",
  isReady: () => typeof window.gtag === "function",
  send: (eventName, params) => {
    window.gtag?.("event", eventName, params);
  },
};
