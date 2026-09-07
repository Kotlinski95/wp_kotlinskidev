import React from "react";
import {
  BaseControl,
  ColorPalette,
  RangeControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
  LOAD_MORE_BUTTON_ALIGN_VALUES,
  type LoadMoreAttribute,
  type LoadMoreButtonAlign,
} from "./types";

interface LoadMoreStyleControlsProps {
  value: LoadMoreAttribute;
  onChange: (changes: Partial<LoadMoreAttribute>) => void;
}

const ALIGN_LABELS: Record<LoadMoreButtonAlign, string> = {
  left: __("Left", "kotlinskidev"),
  center: __("Center", "kotlinskidev"),
  right: __("Right", "kotlinskidev"),
};

interface ColorRowProps {
  label: string;
  id: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorRow({ label, id, color, onChange }: ColorRowProps) {
  return (
    <BaseControl label={label} id={id}>
      <ColorPalette value={color || undefined} onChange={(value) => onChange(value ?? "")} />
    </BaseControl>
  );
}

export default function LoadMoreStyleControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
      <SelectControl
        label={__("Button position", "kotlinskidev")}
        value={value.buttonAlign}
        options={LOAD_MORE_BUTTON_ALIGN_VALUES.map((align) => ({
          label: ALIGN_LABELS[align],
          value: align,
        }))}
        onChange={(align) => onChange({ buttonAlign: align as LoadMoreButtonAlign })}
      />

      <ColorRow
        label={__("Text color", "kotlinskidev")}
        id="kt-load-more-text-color"
        color={value.textColor}
        onChange={(textColor) => onChange({ textColor })}
      />

      <ColorRow
        label={__("Background color", "kotlinskidev")}
        id="kt-load-more-bg-color"
        color={value.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />

      <ColorRow
        label={__("Border color", "kotlinskidev")}
        id="kt-load-more-border-color"
        color={value.borderColor}
        onChange={(borderColor) => onChange({ borderColor })}
      />

      <RangeControl
        label={__("Border width (px)", "kotlinskidev")}
        value={value.borderWidth}
        onChange={(width) => onChange({ borderWidth: width ?? 0 })}
        min={0}
        max={10}
      />

      <RangeControl
        label={__("Border radius (px)", "kotlinskidev")}
        value={value.borderRadius}
        onChange={(radius) => onChange({ borderRadius: radius ?? 0 })}
        min={0}
        max={40}
      />

      <ToggleControl
        label={__("Underline text", "kotlinskidev")}
        checked={value.underline}
        onChange={(underline) => onChange({ underline })}
      />

      <BaseControl label={__("Hover state", "kotlinskidev")} id="kt-load-more-hover-heading">
        {__("Leave a hover color empty to keep the default fade effect.", "kotlinskidev")}
      </BaseControl>

      <ColorRow
        label={__("Hover text color", "kotlinskidev")}
        id="kt-load-more-hover-text-color"
        color={value.hoverTextColor}
        onChange={(hoverTextColor) => onChange({ hoverTextColor })}
      />

      <ColorRow
        label={__("Hover background color", "kotlinskidev")}
        id="kt-load-more-hover-bg-color"
        color={value.hoverBackgroundColor}
        onChange={(hoverBackgroundColor) => onChange({ hoverBackgroundColor })}
      />

      <ColorRow
        label={__("Hover border color", "kotlinskidev")}
        id="kt-load-more-hover-border-color"
        color={value.hoverBorderColor}
        onChange={(hoverBorderColor) => onChange({ hoverBorderColor })}
      />
    </>
  );
}
