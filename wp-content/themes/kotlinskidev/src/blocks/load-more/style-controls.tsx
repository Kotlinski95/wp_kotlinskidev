import React from "react";
import {
  BaseControl,
  ColorPalette,
  RangeControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { useSettings } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
  LOAD_MORE_BUTTON_ALIGN_VALUES,
  LOAD_MORE_FONT_SIZE_SLUGS,
  LOAD_MORE_FONT_WEIGHT_VALUES,
  LOAD_MORE_LETTER_SPACING_VALUES,
  LOAD_MORE_PADDING_X_RANGE,
  LOAD_MORE_PADDING_Y_RANGE,
  LOAD_MORE_TEXT_TRANSFORM_VALUES,
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

const FONT_WEIGHT_LABELS: Record<string, string> = {
  "400": __("Regular", "kotlinskidev"),
  "500": __("Medium", "kotlinskidev"),
  "600": __("Semi bold", "kotlinskidev"),
  "700": __("Bold", "kotlinskidev"),
  "800": __("Extra bold", "kotlinskidev"),
};

const LETTER_SPACING_LABELS: Record<string, string> = {
  none: __("None", "kotlinskidev"),
  wide: __("Wide", "kotlinskidev"),
  wider: __("Wider", "kotlinskidev"),
};

const TEXT_TRANSFORM_LABELS: Record<string, string> = {
  none: __("None", "kotlinskidev"),
  uppercase: __("Uppercase", "kotlinskidev"),
  capitalize: __("Capitalize", "kotlinskidev"),
};

interface FontSizePreset {
  name?: string;
  slug: string;
}

const DEFAULT_OPTION = { label: __("Default", "kotlinskidev"), value: "" };

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

function resolveFontSizeLabel(slug: string, presets: FontSizePreset[]): string {
  return presets.find((preset) => preset.slug === slug)?.name || slug;
}

function TextStyleControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
      <SelectControl
        label={__("Letter spacing", "kotlinskidev")}
        value={value.letterSpacing}
        options={[
          DEFAULT_OPTION,
          ...Object.keys(LOAD_MORE_LETTER_SPACING_VALUES).map((key) => ({
            label: LETTER_SPACING_LABELS[key],
            value: key,
          })),
        ]}
        onChange={(letterSpacing) => onChange({ letterSpacing })}
      />

      <SelectControl
        label={__("Text transform", "kotlinskidev")}
        value={value.textTransform}
        options={[
          DEFAULT_OPTION,
          ...LOAD_MORE_TEXT_TRANSFORM_VALUES.map((transform) => ({
            label: TEXT_TRANSFORM_LABELS[transform],
            value: transform,
          })),
        ]}
        onChange={(textTransform) => onChange({ textTransform })}
      />
    </>
  );
}

function FontControls({ value, onChange }: LoadMoreStyleControlsProps) {
  const [fontSizePresets] = useSettings("typography.fontSizes") as [FontSizePreset[] | undefined];
  const presets = fontSizePresets ?? [];

  return (
    <>
      <SelectControl
        label={__("Font size", "kotlinskidev")}
        value={value.fontSize}
        options={[
          DEFAULT_OPTION,
          ...LOAD_MORE_FONT_SIZE_SLUGS.map((slug) => ({
            label: resolveFontSizeLabel(slug, presets),
            value: slug,
          })),
        ]}
        onChange={(fontSize) => onChange({ fontSize })}
      />

      <SelectControl
        label={__("Font weight", "kotlinskidev")}
        value={value.fontWeight}
        options={[
          DEFAULT_OPTION,
          ...LOAD_MORE_FONT_WEIGHT_VALUES.map((weight) => ({
            label: FONT_WEIGHT_LABELS[weight],
            value: weight,
          })),
        ]}
        onChange={(fontWeight) => onChange({ fontWeight })}
      />
    </>
  );
}

function TypographyControls({ value, onChange }: LoadMoreStyleControlsProps) {
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

      <BaseControl label={__("Typography", "kotlinskidev")} id="kt-load-more-typography-heading">
        {null}
      </BaseControl>

      <FontControls value={value} onChange={onChange} />

      <TextStyleControls value={value} onChange={onChange} />
    </>
  );
}

function SpacingControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
      <BaseControl label={__("Spacing", "kotlinskidev")} id="kt-load-more-spacing-heading">
        {null}
      </BaseControl>

      <RangeControl
        label={__("Vertical padding (rem)", "kotlinskidev")}
        value={value.paddingY ?? undefined}
        onChange={(paddingY) => onChange({ paddingY: paddingY ?? null })}
        allowReset
        {...LOAD_MORE_PADDING_Y_RANGE}
      />

      <RangeControl
        label={__("Horizontal padding (rem)", "kotlinskidev")}
        value={value.paddingX ?? undefined}
        onChange={(paddingX) => onChange({ paddingX: paddingX ?? null })}
        allowReset
        {...LOAD_MORE_PADDING_X_RANGE}
      />
    </>
  );
}

function BorderControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
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
    </>
  );
}

function AppearanceControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
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
      <BorderControls value={value} onChange={onChange} />
    </>
  );
}

function HoverStateControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
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

export default function LoadMoreStyleControls({ value, onChange }: LoadMoreStyleControlsProps) {
  return (
    <>
      <TypographyControls value={value} onChange={onChange} />
      <SpacingControls value={value} onChange={onChange} />
      <AppearanceControls value={value} onChange={onChange} />
      <HoverStateControls value={value} onChange={onChange} />
    </>
  );
}
