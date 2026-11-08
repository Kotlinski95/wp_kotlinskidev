import React from "react";
import { useSettings } from "@wordpress/block-editor";
import { SelectControl, TextControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

export const BLUR_AMOUNT_DEFAULT_VALUE = "";

const CUSTOM_VALUE = "custom";
const DEFAULT_CUSTOM_BLUR = "0.25rem";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function presetVar(slug: string): string {
  return `var(--wp--custom--grid-hover-blur--${slug})`;
}

export interface BlurAmountControlProps {
  value: string;
  onChange: (next: string) => void;
}

export function BlurAmountControl({ value, onChange }: BlurAmountControlProps) {
  const [presets] = useSettings("custom.gridHoverBlur") as [Record<string, string> | undefined];
  const presetSlugs = Object.keys(presets ?? {});
  const resolvedValue = value || BLUR_AMOUNT_DEFAULT_VALUE;
  const matchedSlug = presetSlugs.find((slug) => resolvedValue === presetVar(slug));
  const isCustom = resolvedValue !== BLUR_AMOUNT_DEFAULT_VALUE && !matchedSlug;

  return (
    <Fragment>
      <SelectControl
        label={__("Blur intensity", "kotlinskidev")}
        value={matchedSlug ?? (isCustom ? CUSTOM_VALUE : BLUR_AMOUNT_DEFAULT_VALUE)}
        options={[
          { label: __("Default (0.25rem)", "kotlinskidev"), value: BLUR_AMOUNT_DEFAULT_VALUE },
          ...presetSlugs.map((slug) => ({ label: slugToLabel(slug), value: slug })),
          { label: __("Custom", "kotlinskidev"), value: CUSTOM_VALUE },
        ]}
        onChange={(next: string) => {
          if (next === BLUR_AMOUNT_DEFAULT_VALUE) {
            onChange(BLUR_AMOUNT_DEFAULT_VALUE);
          } else if (next === CUSTOM_VALUE) {
            onChange(isCustom ? resolvedValue : DEFAULT_CUSTOM_BLUR);
          } else {
            onChange(presetVar(next));
          }
        }}
        help={__(
          "Presets come from theme.json's settings.custom.gridHoverBlur — add more there to offer them here.",
          "kotlinskidev"
        )}
        __nextHasNoMarginBottom
      />
      {isCustom && (
        <TextControl
          label={__("Custom blur amount", "kotlinskidev")}
          value={resolvedValue}
          onChange={onChange}
          placeholder={DEFAULT_CUSTOM_BLUR}
          help={__("Any CSS length, e.g. 0.5rem or 8px.", "kotlinskidev")}
          __next40pxDefaultSize
          __nextHasNoMarginBottom
        />
      )}
    </Fragment>
  );
}
