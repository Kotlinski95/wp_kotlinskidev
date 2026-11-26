import { __ } from "@wordpress/i18n";
import type { Visibility } from "./navigation-types";

export const overlayMenuOptions = [
  { label: __("Never — always inline", "kotlinskidev"), value: "never" },
  { label: __("On mobile only", "kotlinskidev"), value: "mobile" },
  { label: __("Always — hamburger", "kotlinskidev"), value: "always" },
];

export const displayModeOptions = [
  { label: __("Mega menu bar", "kotlinskidev"), value: "mega" },
  { label: __("Flat link list", "kotlinskidev"), value: "list" },
  { label: __("Mobile bottom bar", "kotlinskidev"), value: "bar" },
];

export const visibilityOptions = [
  { label: __("Always visible", "kotlinskidev"), value: "all" },
  { label: __("Desktop only", "kotlinskidev"), value: "desktop" },
  { label: __("Mobile & tablet only", "kotlinskidev"), value: "mobile" },
];

export const overlaySlideOptions = [
  { label: __("From right", "kotlinskidev"), value: "right" },
  { label: __("From left", "kotlinskidev"), value: "left" },
];

export const hamburgerLineAlignOptions = [
  { label: __("Right", "kotlinskidev"), value: "right" },
  { label: __("Left", "kotlinskidev"), value: "left" },
];

export const visibilityClassMap: Record<Visibility, string> = {
  all: "",
  desktop: "nav-desktop",
  mobile: "nav-mobile",
};
