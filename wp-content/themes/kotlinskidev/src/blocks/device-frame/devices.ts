import { __ } from "@wordpress/i18n";

export type DeviceType = "desktop" | "tablet" | "phone";

export const DEVICE_ASPECT_RATIOS: Record<DeviceType, string> = {
  desktop: "16/10",
  tablet: "4/3",
  phone: "9/19",
};

export const DEVICE_PLACEHOLDERS: Record<DeviceType, string> = {
  desktop: __("Desktop screenshot or video", "kotlinskidev"),
  tablet: __("Tablet screenshot or video", "kotlinskidev"),
  phone: __("Mobile screenshot or video", "kotlinskidev"),
};

export type PositionStyle = "" | "angled" | "overlap" | "faded" | "peek-top";

export const POSITION_STYLE_OPTIONS: { label: string; value: PositionStyle }[] = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Angled", "kotlinskidev"), value: "angled" },
  { label: __("Overlap", "kotlinskidev"), value: "overlap" },
  { label: __("Faded Window", "kotlinskidev"), value: "faded" },
  { label: __("Peek Top", "kotlinskidev"), value: "peek-top" },
];

export type LoadingStrategy = "lazy" | "eager";

export const LOADING_OPTIONS: { label: string; value: LoadingStrategy }[] = [
  { label: __("Lazy (default)", "kotlinskidev"), value: "lazy" },
  { label: __("Eager", "kotlinskidev"), value: "eager" },
];

export type FetchPriority = "auto" | "high" | "low";

export const FETCH_PRIORITY_OPTIONS: { label: string; value: FetchPriority }[] = [
  { label: __("Auto (default)", "kotlinskidev"), value: "auto" },
  { label: __("High", "kotlinskidev"), value: "high" },
  { label: __("Low", "kotlinskidev"), value: "low" },
];
