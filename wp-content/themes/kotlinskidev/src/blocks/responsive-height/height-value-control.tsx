import React from "react";
import { SelectControl, __experimentalUnitControl as UnitControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const HEIGHT_UNITS = [
  { value: "px", label: "px", default: 0 },
  { value: "%", label: "%", default: 0 },
  { value: "rem", label: "rem", default: 0 },
  { value: "vh", label: "vh", default: 0 },
];

const CUSTOM_VALUE = "__custom__";

const HEIGHT_KEYWORD_OPTIONS = [
  { label: __("Custom value", "kotlinskidev"), value: CUSTOM_VALUE },
  { label: __("None", "kotlinskidev"), value: "none" },
];

const isHeightKeyword = (value: string): boolean =>
  HEIGHT_KEYWORD_OPTIONS.some((option) => option.value === value && option.value !== CUSTOM_VALUE);

interface HeightValueControlProps {
  label: string;
  presetLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export const HeightValueControl = ({
  label,
  presetLabel,
  value,
  onChange,
}: HeightValueControlProps) => {
  const selected = isHeightKeyword(value) ? value : CUSTOM_VALUE;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <SelectControl
        label={presetLabel}
        value={selected}
        options={HEIGHT_KEYWORD_OPTIONS}
        onChange={(next: string) => onChange(next === CUSTOM_VALUE ? "" : next)}
      />
      {selected === CUSTOM_VALUE && (
        <UnitControl
          label={label}
          value={value}
          units={HEIGHT_UNITS}
          onChange={(next: string | undefined) => onChange(next || "")}
        />
      )}
    </div>
  );
};
