import type { AnalyticsProvider, AnalyticsProviderId } from "./types";
import { gtagProvider } from "./gtag-provider";
import { metaPixelProvider } from "./meta-pixel-provider";

const ALL_PROVIDERS: AnalyticsProvider[] = [gtagProvider, metaPixelProvider];

const DEFAULT_PROVIDER_IDS: readonly AnalyticsProviderId[] = ["gtag"];

const EVENT_PROVIDER_IDS: Record<string, readonly AnalyticsProviderId[]> = {
  generate_lead: ["gtag", "meta"],
};

export function providersForEvent(eventName: string): AnalyticsProvider[] {
  const ids = EVENT_PROVIDER_IDS[eventName] ?? DEFAULT_PROVIDER_IDS;
  return ALL_PROVIDERS.filter((provider) => ids.includes(provider.id));
}
