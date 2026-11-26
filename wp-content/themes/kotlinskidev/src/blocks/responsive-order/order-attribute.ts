import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { RESPONSIVE_DEVICES } from "@utils/responsive-breakpoints";

export type ResponsiveOrderAttribute = Record<ResponsiveDevice, number>;

export interface ResponsiveOrderAttributes {
  responsiveOrder?: ResponsiveOrderAttribute;
}

export const emptyResponsiveOrder = (): ResponsiveOrderAttribute => ({
  desktop: 0,
  tablet: 0,
  mobile: 0,
});

export const buildOrderClassString = (
  responsiveOrder: ResponsiveOrderAttribute | undefined
): string => {
  if (!responsiveOrder) {
    return "";
  }

  let classString = "";
  RESPONSIVE_DEVICES.forEach((device) => {
    const order = responsiveOrder[device];
    if (order !== 0) {
      classString += ` order-${device}-${order}`;
    }
  });

  return classString;
};
