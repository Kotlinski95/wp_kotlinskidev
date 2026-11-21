import React from "react";
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { SelectControl, Button, RangeControl } from "@wordpress/components";
import type { FontSizeChange, FontSizeOption } from "./font-size-types";

const DEFAULT_CUSTOM_SIZE = "1rem";
const DEFAULT_NUMERIC_SIZE = 1;
const MIN_CUSTOM_SIZE_REM = 0.5;
const MAX_CUSTOM_SIZE_REM = 6.25;
const CUSTOM_SIZE_STEP_REM = 0.03125;

const SLIDERS_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m19 7.5h-7.628c-.3089-.87389-1.1423-1.5-2.122-1.5-.97966 0-1.81309.62611-2.12197 1.5h-2.12803v1.5h2.12803c.30888.87389 1.14231 1.5 2.12197 1.5.9797 0 1.8131-.62611 2.122-1.5h7.628z"></path>
    <path d="m19 15h-2.128c-.3089-.8739-1.1423-1.5-2.122-1.5s-1.8131.6261-2.122 1.5h-7.628v1.5h7.628c.3089.8739 1.1423 1.5 2.122 1.5s1.8131-.6261 2.122-1.5h2.128z"></path>
  </svg>
);

const getNumericValue = (value: string): number => {
  if (!value) {
    return DEFAULT_NUMERIC_SIZE;
  }
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : DEFAULT_NUMERIC_SIZE;
};

const BreakpointHeader = ({
  icon,
  label,
  breakpointText,
}: {
  icon: string;
  label: string;
  breakpointText: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "0.5rem",
      fontSize: "0.6875rem",
      fontWeight: 500,
      textTransform: "uppercase",
      color: "#757575",
      gap: "0.375rem",
    }}
  >
    <span style={{ fontSize: "0.875rem" }}>{icon}</span>
    {label}
    <span style={{ fontSize: "0.625rem", opacity: 0.7 }}>{breakpointText}</span>
  </div>
);

interface BreakpointControlProps {
  label: string;
  icon: string;
  breakpointText: string;
  value: string;
  isCustom: boolean;
  presetValue?: string;
  customValue?: string;
  fontSizeOptions: FontSizeOption[];
  onChange: (change: FontSizeChange) => void;
}

interface SizeInputProps {
  showCustom: boolean;
  displayValue: string;
  fontSizeOptions: FontSizeOption[];
  onPresetChange: (value: string) => void;
  onCustomChange: (size: number | undefined) => void;
}

const SizeInput = ({
  showCustom,
  displayValue,
  fontSizeOptions,
  onPresetChange,
  onCustomChange,
}: SizeInputProps) =>
  showCustom ? (
    <RangeControl
      value={getNumericValue(displayValue)}
      onChange={onCustomChange}
      min={MIN_CUSTOM_SIZE_REM}
      max={MAX_CUSTOM_SIZE_REM}
      step={CUSTOM_SIZE_STEP_REM}
      withInputField
      help={`${getNumericValue(displayValue)}rem`}
    />
  ) : (
    <SelectControl
      value={displayValue}
      options={fontSizeOptions}
      onChange={onPresetChange}
      style={{ width: "100%" }}
    />
  );

const CustomToggleButton = ({
  showCustom,
  onToggle,
}: {
  showCustom: boolean;
  onToggle: () => void;
}) => (
  <Button
    variant="tertiary"
    size="small"
    onClick={onToggle}
    isPressed={showCustom}
    icon={SLIDERS_ICON}
    aria-label={__("Set custom size", "kotlinskidev")}
    style={{ minWidth: "2.25rem", height: "2.25rem" }}
  />
);

const resolveDisplayValue = (
  showCustom: boolean,
  { value, presetValue, customValue }: Pick<SizeSource, "value" | "presetValue" | "customValue">
): string =>
  showCustom ? customValue || value || DEFAULT_CUSTOM_SIZE : presetValue || value || "";

interface SizeSource {
  value: string;
  presetValue: string;
  customValue: string;
  onChange: (change: FontSizeChange) => void;
}

const createSizeHandlers = (
  { value, presetValue, customValue, onChange }: SizeSource,
  showCustom: boolean,
  setShowCustom: (showCustom: boolean) => void
) => ({
  onPresetChange: (newValue: string) => {
    setShowCustom(false);
    onChange({ value: newValue, isCustom: false, presetValue: newValue, customValue });
  },
  onCustomToggle: () => {
    const newShowCustom = !showCustom;
    setShowCustom(newShowCustom);
    if (newShowCustom) {
      const valueToUse = customValue || value || DEFAULT_CUSTOM_SIZE;
      onChange({ value: valueToUse, isCustom: true, presetValue, customValue: valueToUse });
    } else {
      const valueToUse = presetValue || "";
      onChange({ value: valueToUse, isCustom: false, presetValue: valueToUse, customValue });
    }
  },
  onCustomChange: (newSize: number | undefined) => {
    if (typeof newSize === "number") {
      const newCustomValue = `${newSize}rem`;
      onChange({ value: newCustomValue, isCustom: true, presetValue, customValue: newCustomValue });
    }
  },
});

export const BreakpointControl: React.FC<BreakpointControlProps> = ({
  label,
  icon,
  breakpointText,
  value,
  isCustom,
  presetValue = "",
  customValue = DEFAULT_CUSTOM_SIZE,
  fontSizeOptions,
  onChange,
}) => {
  const [showCustom, setShowCustom] = useState(isCustom);

  useEffect(() => {
    setShowCustom(isCustom);
  }, [isCustom]);

  const displayValue = resolveDisplayValue(showCustom, { value, presetValue, customValue });
  const { onPresetChange, onCustomToggle, onCustomChange } = createSizeHandlers(
    { value, presetValue, customValue, onChange },
    showCustom,
    setShowCustom
  );

  return (
    <div style={{ marginBottom: "1rem", width: "100%" }}>
      <BreakpointHeader icon={icon} label={label} breakpointText={breakpointText} />

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <SizeInput
            showCustom={showCustom}
            displayValue={displayValue}
            fontSizeOptions={fontSizeOptions}
            onPresetChange={onPresetChange}
            onCustomChange={onCustomChange}
          />
        </div>

        <CustomToggleButton showCustom={showCustom} onToggle={onCustomToggle} />
      </div>
    </div>
  );
};
