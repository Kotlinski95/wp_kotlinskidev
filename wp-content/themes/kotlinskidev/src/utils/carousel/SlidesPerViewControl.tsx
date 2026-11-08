import React from "react";
import { RangeControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface SlidesPerViewControlProps {
  label: string;
  value: number | "auto";
  onChange: (value: number | "auto") => void;
}

export default function SlidesPerViewControl({
  label,
  value,
  onChange,
}: SlidesPerViewControlProps) {
  const isAuto = value === "auto";

  return (
    <div className="kt-slides-per-view-control">
      <ToggleControl
        label={`${label} (${__("Auto", "kotlinskidev")})`}
        help={__(
          "Slide width follows the image; the visible slide count adapts to available space.",
          "kotlinskidev"
        )}
        checked={isAuto}
        onChange={(checked) => onChange(checked ? "auto" : 1)}
      />
      {!isAuto && (
        <RangeControl
          label={label}
          value={value}
          onChange={(next) => onChange(next ?? 1)}
          min={1}
          max={5}
        />
      )}
    </div>
  );
}
