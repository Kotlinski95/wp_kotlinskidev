export type AnalyticsEventParams = Record<string, string | number | boolean>;

export type AnalyticsProviderId = "gtag" | "meta";

export interface AnalyticsProvider {
  id: AnalyticsProviderId;
  isReady: () => boolean;
  send: (eventName: string, params: AnalyticsEventParams) => void;
}
