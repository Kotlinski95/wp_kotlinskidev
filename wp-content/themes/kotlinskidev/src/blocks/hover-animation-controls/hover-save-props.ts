import type { ExtraProps } from "@utils/block-filter-types";
import { DEFAULT_OPACITY_FROM, DEFAULT_OPACITY_TO } from "./hover-attributes";
import type { HoverAnimationAttributes } from "./hover-attributes";

const PERCENT = 100;

type HoverStyle = Record<string, string | number>;

const buildHoverStyle = (attributes: HoverAnimationAttributes): HoverStyle => {
  const {
    hoverAnimation,
    hoverBackgroundColor,
    hoverTextColor,
    hoverOpacityEnabled,
    hoverOpacityFrom,
    hoverOpacityTo,
    hoverBorderColor,
    hoverEnhancedGlow,
  } = attributes;
  const style: HoverStyle = {};

  if (hoverBackgroundColor) {
    style["--hover-bg-color"] = hoverBackgroundColor;
  }

  if (hoverTextColor) {
    style["--hover-text-color"] = hoverTextColor;
    if (hoverEnhancedGlow && !hoverTextColor.includes("gradient")) {
      style["--hover-text-spotlight-color"] = hoverTextColor;
    }
  }

  if (hoverOpacityEnabled) {
    style["--hover-opacity-from"] = (hoverOpacityFrom ?? DEFAULT_OPACITY_FROM) / PERCENT;
    style["--hover-opacity-to"] = (hoverOpacityTo ?? DEFAULT_OPACITY_TO) / PERCENT;
  }

  if (hoverBorderColor) {
    style["--hover-border-color"] = hoverBorderColor;
  }

  const borderRadius = attributes?.style?.border?.radius;
  if (hoverAnimation === "hover-zoom-bg" && typeof borderRadius === "string" && borderRadius) {
    style["--hover-zoom-radius"] = borderRadius;
  }

  return style;
};

const buildHoverStateClasses = (attributes: HoverAnimationAttributes): string[] => {
  const {
    hoverBackgroundColor,
    hoverTextColor,
    hoverOpacityEnabled,
    hoverBorderColor,
    hoverEnhancedGlow,
  } = attributes;
  const classes: string[] = [];

  if (hoverBackgroundColor || hoverTextColor) {
    classes.push("has-hover-color-transition");
  }

  if (hoverBackgroundColor) {
    classes.push("has-hover-bg-color");
  }

  if (hoverTextColor) {
    if (!hoverEnhancedGlow) {
      classes.push("has-hover-text-color");
    }
    if (hoverTextColor.includes("gradient")) {
      classes.push("has-hover-text-gradient");
    }
  }

  if (hoverOpacityEnabled) {
    classes.push("has-hover-opacity");
  }

  if (hoverBorderColor) {
    classes.push("has-hover-border");
  }

  if (hoverEnhancedGlow) {
    classes.push("has-enhanced-hover-glow");
  }

  return classes;
};

export const applyHoverAnimationClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: HoverAnimationAttributes
): ExtraProps => {
  const { hoverAnimation, hoverAnimationExtra } = attributes;

  const extraEffects = Array.isArray(hoverAnimationExtra) ? hoverAnimationExtra : [];
  const classes = [
    ...new Set([extraProps.className, hoverAnimation, ...extraEffects].filter(Boolean)),
  ] as string[];
  classes.push(...buildHoverStateClasses(attributes));

  const style = buildHoverStyle(attributes);
  if (Object.keys(style).length) {
    extraProps.style = { ...extraProps.style, ...style };
  }

  if (classes.length) {
    extraProps.className = classes.join(" ");
  }

  return extraProps;
};
