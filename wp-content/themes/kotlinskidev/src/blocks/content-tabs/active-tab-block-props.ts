import type React from "react";
import {
  DEFAULT_NAV_GAP,
  isGradientValue,
  type ContentTabsAttributes,
} from "./content-tabs-attributes";

export const buildActiveTabClasses = (attributes: ContentTabsAttributes): string => {
  const {
    activeTabUnderline,
    activeTabTextColorEnabled,
    activeTabColor,
    activeTabBackgroundEnabled,
    activeTabBackgroundColor,
    activeTabBorderColorEnabled,
    activeTabBorderColor,
  } = attributes;
  const isActiveTextGradient = isGradientValue(activeTabColor);
  const isActiveBgGradient = isGradientValue(activeTabBackgroundColor);

  return [
    activeTabUnderline && "kt-content-tabs--active-underline",
    activeTabTextColorEnabled &&
      activeTabColor &&
      (isActiveTextGradient
        ? "kt-content-tabs--active-text-gradient"
        : "kt-content-tabs--active-text-color"),
    activeTabBackgroundEnabled && activeTabBackgroundColor && "kt-content-tabs--active-background",
    activeTabBackgroundEnabled &&
      activeTabBackgroundColor &&
      isActiveBgGradient &&
      "kt-content-tabs--active-background-gradient",
    activeTabBorderColorEnabled && activeTabBorderColor && "kt-content-tabs--active-border-color",
  ]
    .filter(Boolean)
    .join(" ");
};

export const buildActiveTabStyle = (attributes: ContentTabsAttributes): React.CSSProperties => {
  const {
    navGap,
    activeTabTextColorEnabled,
    activeTabColor,
    activeTabBackgroundEnabled,
    activeTabBackgroundColor,
    activeTabBorderColorEnabled,
    activeTabBorderColor,
  } = attributes;
  const resolvedNavGap = navGap || {};

  return {
    "--kt-content-tabs-nav-gap-desktop": `${resolvedNavGap.desktop ?? DEFAULT_NAV_GAP}px`,
    ...(activeTabTextColorEnabled && activeTabColor
      ? { "--kt-content-tabs-active-color": activeTabColor }
      : {}),
    ...(activeTabBackgroundEnabled && activeTabBackgroundColor
      ? { "--kt-content-tabs-active-bg": activeTabBackgroundColor }
      : {}),
    ...(activeTabBorderColorEnabled && activeTabBorderColor
      ? { "--kt-content-tabs-active-border-color": activeTabBorderColor }
      : {}),
  } as React.CSSProperties;
};
