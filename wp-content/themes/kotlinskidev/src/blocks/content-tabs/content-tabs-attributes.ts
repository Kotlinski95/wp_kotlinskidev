export interface NavGap {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}

export interface ContentTabsAttributes {
  navPosition: "top" | "bottom" | "left" | "right";
  navPositionMobile: "top" | "bottom";
  navGap: NavGap;
  activeTabUnderline: boolean;
  activeTabTextColorEnabled: boolean;
  activeTabColor: string;
  activeTabBackgroundEnabled: boolean;
  activeTabBackgroundColor: string;
  activeTabBorderColorEnabled: boolean;
  activeTabBorderColor: string;
  panelTransition: string;
  cardAnimation: string;
}

export interface ContentTabsSettingsProps {
  attributes: ContentTabsAttributes;
  setAttributes: (attrs: Partial<ContentTabsAttributes>) => void;
}

export interface ContentTabsEditProps extends ContentTabsSettingsProps {
  clientId: string;
}

export const DEFAULT_NAV_GAP = 8;
export type NavGapDevice = keyof NavGap;
export const NAV_GAP_DEVICES: NavGapDevice[] = ["desktop", "tablet", "mobile"];
export const MAX_NAV_GAP_PX = 48;

export const isGradientValue = (value: string | undefined): boolean =>
  (value || "").includes("gradient");
