import React from "react";
import { SelectControl, __experimentalUnitControl as UnitControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const WIDTH_UNITS = [
  { value: "px", label: "px", default: 0, step: 1 },
  { value: "%", label: "%", default: 0, step: 0.1 },
  { value: "rem", label: "rem", default: 0, step: 0.01 },
  { value: "vw", label: "vw", default: 0, step: 0.1 },
];

const CUSTOM_VALUE = "__custom__";

const WIDTH_KEYWORD_OPTIONS = [
  { label: __("Custom value", "kotlinskidev"), value: CUSTOM_VALUE },
  { label: __("Auto", "kotlinskidev"), value: "auto" },
  { label: __("Max Content", "kotlinskidev"), value: "max-content" },
  { label: __("Min Content", "kotlinskidev"), value: "min-content" },
  { label: __("Fit Content", "kotlinskidev"), value: "fit-content" },
  { label: __("Stretch", "kotlinskidev"), value: "stretch" },
];

const isWidthKeyword = (value: string): boolean =>
  WIDTH_KEYWORD_OPTIONS.some((option) => option.value === value && option.value !== CUSTOM_VALUE);

interface WidthValueControlProps {
  label: string;
  presetLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export const WidthValueControl = ({
  label,
  presetLabel,
  value,
  onChange,
}: WidthValueControlProps) => {
  const selected = isWidthKeyword(value) ? value : CUSTOM_VALUE;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <SelectControl
        label={presetLabel}
        value={selected}
        options={WIDTH_KEYWORD_OPTIONS}
        onChange={(next: string) => onChange(next === CUSTOM_VALUE ? "" : next)}
      />
      {selected === CUSTOM_VALUE && (
        <UnitControl
          label={label}
          value={value}
          units={WIDTH_UNITS}
          onChange={(next: string | undefined) => onChange(next || "")}
        />
      )}
    </div>
  );
};
