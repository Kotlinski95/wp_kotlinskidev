export interface ResponsiveBreakpoints {
  mobile_max: number;
  tablet_min: number;
  tablet_max: number;
  desktop_min: number;
}

declare global {
  interface Window {
    kotlinskidevBreakpoints?: ResponsiveBreakpoints;
  }
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile_max: 781,
  tablet_min: 782,
  tablet_max: 1023,
  desktop_min: 1024,
};

export const RESPONSIVE_DEVICES = ["desktop", "tablet", "mobile"] as const;

export type ResponsiveDevice = (typeof RESPONSIVE_DEVICES)[number];

export const getBreakpoints = (): ResponsiveBreakpoints =>
  window.kotlinskidevBreakpoints || DEFAULT_BREAKPOINTS;
