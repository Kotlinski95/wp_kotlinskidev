import type { AnalyticsEventParams } from "./analytics-providers/types";
import { providersForEvent } from "./analytics-providers/routing";

export type { AnalyticsEventParams };

declare global {
  interface Window {
    kotlinskiAnalyticsConfig?: {
      disabledEvents: string[];
    };
  }
}

function isEventDisabled(name: string): boolean {
  return window.kotlinskiAnalyticsConfig?.disabledEvents.includes(name) ?? false;
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}): void {
  if (isEventDisabled(name)) {
    return;
  }
  providersForEvent(name).forEach((provider) => {
    if (provider.isReady()) {
      provider.send(name, params);
    }
  });
}
