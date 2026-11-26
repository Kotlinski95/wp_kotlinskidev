import React from "react";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { getBreakpoints } from "@utils/responsive-breakpoints";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { BreakpointControl } from "./breakpoint-control";
import type {
  FontSizeChange,
  FontSizeOption,
  ResponsiveFontSize,
  ResponsiveFontSizeAttributes,
  ThemeFontSize,
} from "./font-size-types";

const REM_BASE_PX = 16;
const REM_DECIMAL_PLACES = 3;
const DEFAULT_CUSTOM_SIZE = "1rem";

const toRemLabel = (pixels: number): string =>
  `${(pixels / REM_BASE_PX).toFixed(REM_DECIMAL_PLACES).replace(/\.?0+$/, "")}rem`;

const getBreakpointLabels = (): Record<ResponsiveDevice, string> => {
  const breakpoints = getBreakpoints();

  return {
    mobile: `< ${toRemLabel(breakpoints.mobile_max + 1)}`,
    tablet: `${toRemLabel(breakpoints.tablet_min)} - ${toRemLabel(breakpoints.tablet_max)}`,
    desktop: `≥ ${toRemLabel(breakpoints.desktop_min)}`,
  };
};

const buildFontSizeOptions = (themeFontSizes: ThemeFontSize[]): FontSizeOption[] => [
  { label: __("Default", "kotlinskidev"), value: "" },
  ...themeFontSizes.map((size) => ({ label: size.name, value: size.size })),
];

interface DeviceRow {
  device: ResponsiveDevice;
  label: string;
  icon: string;
}

const getDeviceRows = (): DeviceRow[] => [
  { device: "mobile", label: __("Mobile", "kotlinskidev"), icon: "📱" },
  { device: "tablet", label: __("Tablet", "kotlinskidev"), icon: "📱" },
  { device: "desktop", label: __("Desktop", "kotlinskidev"), icon: "🖥️" },
];

interface ResponsiveFontSizeControlProps {
  attributes: ResponsiveFontSizeAttributes;
  setAttributes: (attrs: Partial<ResponsiveFontSizeAttributes>) => void;
}

const TOGGLE_BUTTON_STYLE = {
  width: "100%",
  justifyContent: "space-between",
  padding: "0.5rem 0",
  border: "none",
  borderRadius: "0",
  borderBottom: "0.0625rem solid #ddd",
  background: "transparent",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "#1e1e1e",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const ValuesIndicator = () => (
  <span
    style={{
      width: "0.375rem",
      height: "0.375rem",
      borderRadius: "50%",
      backgroundColor: "#007cba",
      display: "inline-block",
    }}
  />
);

const ExpandToggleButton = ({
  isExpanded,
  hasValues,
  onToggle,
}: {
  isExpanded: boolean;
  hasValues: boolean;
  onToggle: () => void;
}) => (
  <Button variant="tertiary" onClick={onToggle} style={TOGGLE_BUTTON_STYLE}>
    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ fontSize: "1rem" }}>📱</span>
      {__("Responsive font size", "kotlinskidev")}
      {hasValues && <ValuesIndicator />}
    </span>
    <span
      style={{
        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        fontSize: "0.75rem",
      }}
    >
      ▼
    </span>
  </Button>
);

const createFontSizeUpdater = (
  responsiveFontSize: ResponsiveFontSize,
  setAttributes: ResponsiveFontSizeControlProps["setAttributes"]
) => {
  return (device: ResponsiveDevice, change: FontSizeChange) => {
    const { value, isCustom = false, presetValue, customValue } = change;
    const customKey = `${device}Custom` as keyof ResponsiveFontSize;
    const presetKey = `${device}Preset` as keyof ResponsiveFontSize;
    const customValueKey = `${device}CustomValue` as keyof ResponsiveFontSize;

    const finalCustomValue = isCustom
      ? customValue || value
      : customValue || responsiveFontSize[customValueKey] || DEFAULT_CUSTOM_SIZE;

    setAttributes({
      responsiveFontSize: {
        ...responsiveFontSize,
        [device]: value,
        [customKey]: isCustom,
        [presetKey]: presetValue || responsiveFontSize[presetKey] || "",
        [customValueKey]: finalCustomValue,
      },
    });
  };
};

const DeviceControlList = ({
  responsiveFontSize,
  fontSizeOptions,
  onChange,
}: {
  responsiveFontSize: ResponsiveFontSize;
  fontSizeOptions: FontSizeOption[];
  onChange: (device: ResponsiveDevice, change: FontSizeChange) => void;
}) => {
  const breakpointLabels = getBreakpointLabels();

  return (
    <div style={{ paddingTop: "1rem", paddingBottom: "0.5rem", width: "100%" }}>
      {getDeviceRows().map(({ device, label, icon }) => (
        <BreakpointControl
          key={device}
          label={label}
          icon={icon}
          breakpointText={`(${breakpointLabels[device]})`}
          value={responsiveFontSize[device] || ""}
          isCustom={responsiveFontSize[`${device}Custom`] || false}
          presetValue={responsiveFontSize[`${device}Preset`] || ""}
          customValue={
            responsiveFontSize[`${device}CustomValue`] ||
            responsiveFontSize[device] ||
            DEFAULT_CUSTOM_SIZE
          }
          fontSizeOptions={fontSizeOptions}
          onChange={(change) => onChange(device, change)}
        />
      ))}
    </div>
  );
};

export const ResponsiveFontSizeInlineControl: React.FC<ResponsiveFontSizeControlProps> = ({
  attributes,
  setAttributes,
}) => {
  const { responsiveFontSize = {} } = attributes;
  const [isExpanded, setIsExpanded] = useState(false);

  const themeFontSizes = useSelect<ThemeFontSize[]>(
    (select) =>
      (select(blockEditorStore).getSettings() as { fontSizes?: ThemeFontSize[] }).fontSizes ?? [],
    []
  );
  const updateResponsiveFontSize = createFontSizeUpdater(responsiveFontSize, setAttributes);

  const hasValues = Boolean(
    responsiveFontSize.mobile || responsiveFontSize.tablet || responsiveFontSize.desktop
  );

  return (
    <div style={{ marginTop: "1rem", gridColumn: "1 / -1", width: "100%" }}>
      <ExpandToggleButton
        isExpanded={isExpanded}
        hasValues={hasValues}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <DeviceControlList
          responsiveFontSize={responsiveFontSize}
          fontSizeOptions={buildFontSizeOptions(themeFontSizes)}
          onChange={updateResponsiveFontSize}
        />
      )}
    </div>
  );
};
