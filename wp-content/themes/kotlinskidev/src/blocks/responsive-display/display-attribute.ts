import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { RESPONSIVE_DEVICES } from "@utils/responsive-breakpoints";

export type DisplayProperty =
  | "display"
  | "flexDirection"
  | "justifyContent"
  | "alignItems"
  | "justifySelf"
  | "alignSelf";

export type DeviceDisplaySettings = Partial<Record<DisplayProperty, string>>;

export type ResponsiveDisplayAttribute = Partial<
  Record<ResponsiveDevice, DeviceDisplaySettings | null>
>;

export interface ResponsiveDisplayAttributes {
  responsiveDisplay?: ResponsiveDisplayAttribute;
}

export const DISPLAY_PROPERTIES: DisplayProperty[] = [
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "justifySelf",
  "alignSelf",
];

export const emptyResponsiveDisplay = (): ResponsiveDisplayAttribute => ({
  desktop: {},
  tablet: {},
  mobile: {},
});

export const hasAnyDisplaySetting = (responsiveDisplay: ResponsiveDisplayAttribute): boolean =>
  RESPONSIVE_DEVICES.some((device) => {
    const settings = responsiveDisplay[device];
    return Boolean(settings) && Object.values(settings as object).some(Boolean);
  });

export const buildDisplayClassString = (
  responsiveDisplay: ResponsiveDisplayAttribute | undefined
): string => {
  if (!responsiveDisplay) {
    return "";
  }

  let classString = "";
  RESPONSIVE_DEVICES.forEach((device) => {
    const settings = responsiveDisplay[device];
    if (!settings) {
      return;
    }
    DISPLAY_PROPERTIES.forEach((property) => {
      if (settings[property]) {
        classString += ` ${device}:${settings[property]}`;
      }
    });
  });

  return classString;
};
