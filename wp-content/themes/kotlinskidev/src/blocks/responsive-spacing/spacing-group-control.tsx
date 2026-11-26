import React from "react";
import { __experimentalUnitControl as UnitControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { EMPTY_SPACING_VALUE, SPACING_SIDES } from "./spacing-attribute";
import type { SpacingSide, SpacingSideValues, SpacingType } from "./spacing-attribute";

const SPACING_UNITS = [
  { value: "px", label: "px", step: 1 },
  { value: "%", label: "%", step: 0.1 },
  { value: "rem", label: "rem", step: 0.01 },
  { value: "em", label: "em", step: 0.01 },
  { value: "vw", label: "vw", step: 0.1 },
  { value: "vh", label: "vh", step: 0.1 },
];

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

interface SpacingGroupControlProps {
  type: SpacingType;
  values: SpacingSideValues;
  onChangeSide: (side: SpacingSide, value: string) => void;
}

export const SpacingGroupControl = ({ type, values, onChangeSide }: SpacingGroupControlProps) => (
  <div style={{ marginBottom: "0.75rem" }}>
    <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
      {type === "Padding" ? __("Padding", "kotlinskidev") : __("Margin", "kotlinskidev")}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
      {SPACING_SIDES.map((side) => (
        <UnitControl
          key={side}
          label={capitalize(side)}
          size="small"
          value={values[side]}
          units={SPACING_UNITS}
          min={type === "Padding" ? 0 : undefined}
          onChange={(value: string | undefined) => onChangeSide(side, value || EMPTY_SPACING_VALUE)}
        />
      ))}
    </div>
  </div>
);
