import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { RESPONSIVE_DEVICES } from "@utils/responsive-breakpoints";

export type SpacingSide = "top" | "right" | "bottom" | "left";
export type SpacingSideValues = Record<SpacingSide, string>;
export type SpacingType = "Padding" | "Margin";

export type ResponsiveSpacingAttributes = Record<
  `${ResponsiveDevice}${SpacingType}`,
  SpacingSideValues
>;

export const SPACING_SIDES: SpacingSide[] = ["top", "right", "bottom", "left"];
export const SPACING_TYPES: SpacingType[] = ["Padding", "Margin"];

export const EMPTY_SPACING_VALUE = "0px";

export const DEFAULT_SIDE_VALUES: SpacingSideValues = {
  top: EMPTY_SPACING_VALUE,
  right: EMPTY_SPACING_VALUE,
  bottom: EMPTY_SPACING_VALUE,
  left: EMPTY_SPACING_VALUE,
};

export const buildSpacingAttributeDefaults = (): Record<string, unknown> => {
  const spacingAttributes: Record<string, unknown> = {};
  RESPONSIVE_DEVICES.forEach((device) => {
    SPACING_TYPES.forEach((type) => {
      spacingAttributes[`${device}${type}`] = {
        type: "object",
        default: { ...DEFAULT_SIDE_VALUES },
      };
    });
  });
  return spacingAttributes;
};

export const hasAnyResponsiveSpacingValue = (
  attributes: Partial<ResponsiveSpacingAttributes>
): boolean => {
  return RESPONSIVE_DEVICES.some((device) =>
    SPACING_TYPES.some((type) => {
      const values = attributes[`${device}${type}`];
      return (
        values && SPACING_SIDES.some((side) => values[side] && values[side] !== EMPTY_SPACING_VALUE)
      );
    })
  );
};

const SIDE_TO_CSS_PROPERTY: Record<SpacingType, Record<SpacingSide, string>> = {
  Padding: {
    top: "paddingTop",
    right: "paddingRight",
    bottom: "paddingBottom",
    left: "paddingLeft",
  },
  Margin: {
    top: "marginTop",
    right: "marginRight",
    bottom: "marginBottom",
    left: "marginLeft",
  },
};

export const buildResponsiveSpacingPreviewStyle = (
  attributes: Partial<ResponsiveSpacingAttributes> | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!attributes) {
    return style;
  }

  SPACING_TYPES.forEach((type) => {
    const values = attributes[`desktop${type}`];
    if (!values) {
      return;
    }
    SPACING_SIDES.forEach((side) => {
      const value = values[side];
      if (value && value !== EMPTY_SPACING_VALUE) {
        style[SIDE_TO_CSS_PROPERTY[type][side]] = value;
      }
    });
  });

  return style;
};
