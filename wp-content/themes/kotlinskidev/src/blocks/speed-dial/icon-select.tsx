import React from "react";
import { SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import icons from "./icons.json";

const ICON_PATHS = icons as Record<string, string[]>;

const ICON_LABELS: Record<string, string> = {
  plus: __("Plus", "kotlinskidev"),
  close: __("Close", "kotlinskidev"),
  phone: __("Phone", "kotlinskidev"),
  mail: __("Envelope", "kotlinskidev"),
  accessibility: __("Accessibility", "kotlinskidev"),
  link: __("Link", "kotlinskidev"),
  external: __("External link", "kotlinskidev"),
  message: __("Message", "kotlinskidev"),
  "map-pin": __("Map pin", "kotlinskidev"),
  calendar: __("Calendar", "kotlinskidev"),
  sparkles: __("Sparkles", "kotlinskidev"),
  code: __("Code", "kotlinskidev"),
  info: __("Info", "kotlinskidev"),
};

export const BUILT_IN_ICON_SLUGS = Object.keys(ICON_PATHS);

export function SpeedDialIcon({ slug }: Readonly<{ slug: string }>) {
  const paths = ICON_PATHS[slug];
  if (!paths) {
    return null;
  }
  return (
    <svg
      className="kt-speed-dial__icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

interface IconSelectProps {
  value: string;
  onChange: (slug: string) => void;
  allowDefault: boolean;
}

export function IconSelect({ value, onChange, allowDefault }: Readonly<IconSelectProps>) {
  const options = BUILT_IN_ICON_SLUGS.map((slug) => ({
    label: ICON_LABELS[slug] ?? slug,
    value: slug,
  }));
  const withDefault = allowDefault
    ? [{ label: __("Default for this action", "kotlinskidev"), value: "" }, ...options]
    : options;

  return (
    <>
      <SelectControl
        __nextHasNoMarginBottom
        label={__("Icon", "kotlinskidev")}
        value={value}
        options={withDefault}
        onChange={onChange}
      />
      <SpeedDialIcon slug={value} />
    </>
  );
}
