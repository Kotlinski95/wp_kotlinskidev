import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment, useState, useEffect } from "@wordpress/element";
import { InspectorControls, store as blockEditorStore } from "@wordpress/block-editor";
import { SelectControl, Button, RangeControl } from "@wordpress/components";
import { hasBlockSupport } from "@wordpress/blocks";
import { useSelect } from "@wordpress/data";

declare global {
  interface Window {
    kotlinskidevBreakpoints?: {
      mobile_max: number;
      tablet_min: number;
      tablet_max: number;
      desktop_min: number;
    };
  }
}

type ResponsiveFontSizeDevice = "mobile" | "tablet" | "desktop";

interface ResponsiveFontSize {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  mobileCustom?: boolean;
  tabletCustom?: boolean;
  desktopCustom?: boolean;
  mobilePreset?: string;
  tabletPreset?: string;
  desktopPreset?: string;
  mobileCustomValue?: string;
  tabletCustomValue?: string;
  desktopCustomValue?: string;
}

interface FontSizeOption {
  label: string;
  value: string;
}

interface ThemeFontSize {
  name: string;
  slug: string;
  size: string;
}

interface BlockAttributes {
  responsiveFontSize?: ResponsiveFontSize;
}

interface BlockEditProps {
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
  name: string;
}

interface BlockSettings {
  attributes?: Record<string, unknown>;
  supports?: { typography?: unknown; [key: string]: unknown };
  [key: string]: unknown;
}

const addResponsiveFontSizeAttribute = (settings: BlockSettings): BlockSettings => {
  if (!settings.supports?.typography) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveFontSize: {
        type: "object",
        default: {},
      },
    },
  };
};

const buildFontSizeOptions = (themeFontSizes: ThemeFontSize[]): FontSizeOption[] => [
  { label: __("Default", "kotlinskidev"), value: "" },
  ...themeFontSizes.map((size) => ({ label: size.name, value: size.size })),
];

const getBreakpointLabels = () => {
  const bp = window.kotlinskidevBreakpoints || {
    mobile_max: 781,
    tablet_min: 782,
    tablet_max: 1023,
    desktop_min: 1024,
  };

  return {
    mobile: `< ${((bp.mobile_max + 1) / 16).toFixed(3).replace(/\.?0+$/, "")}rem`,
    tablet: `${(bp.tablet_min / 16).toFixed(3).replace(/\.?0+$/, "")}rem - ${(bp.tablet_max / 16).toFixed(3).replace(/\.?0+$/, "")}rem`,
    desktop: `≥ ${(bp.desktop_min / 16).toFixed(3).replace(/\.?0+$/, "")}rem`,
  };
};

interface BreakpointControlProps {
  label: string;
  icon: string;
  breakpointText: string;
  value: string;
  isCustom: boolean;
  presetValue?: string;
  customValue?: string;
  fontSizeOptions: FontSizeOption[];
  onChange: (value: string, isCustom?: boolean, presetValue?: string, customValue?: string) => void;
}

const BreakpointControl: React.FC<BreakpointControlProps> = ({
  label,
  icon,
  breakpointText,
  value,
  isCustom,
  presetValue = "",
  customValue = "1rem",
  fontSizeOptions,
  onChange,
}) => {
  const [showCustom, setShowCustom] = useState(isCustom);

  useEffect(() => {
    setShowCustom(isCustom);
  }, [isCustom]);

  const getNumericValue = (val: string): number => {
    if (!val) return 1;
    const match = val.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 1;
  };

  const getDisplayValue = () => (showCustom ? customValue || value || "1rem" : presetValue || value || "");

  const handlePresetChange = (newValue: string) => {
    setShowCustom(false);
    onChange(newValue, false, newValue, customValue);
  };

  const handleCustomToggle = () => {
    const newShowCustom = !showCustom;
    setShowCustom(newShowCustom);
    if (newShowCustom) {
      const valueToUse = customValue || value || "1rem";
      onChange(valueToUse, true, presetValue, valueToUse);
    } else {
      const valueToUse = presetValue || "";
      onChange(valueToUse, false, valueToUse, customValue);
    }
  };

  const handleCustomChange = (newSize: number | undefined) => {
    if (typeof newSize === "number") {
      const newCustomValue = `${newSize}rem`;
      onChange(newCustomValue, true, presetValue, newCustomValue);
    }
  };

  const displayValue = getDisplayValue();

  return (
    <div style={{ marginBottom: "1rem", width: "100%" }}>
      <label
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
      </label>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          {showCustom ? (
            <RangeControl
              value={getNumericValue(displayValue)}
              onChange={handleCustomChange}
              min={0.5}
              max={6.25}
              step={0.03125}
              withInputField
              help={`${getNumericValue(displayValue)}rem`}
            />
          ) : (
            <SelectControl
              value={displayValue}
              options={fontSizeOptions}
              onChange={handlePresetChange}
              style={{ width: "100%" }}
            />
          )}
        </div>

        <Button
          variant="tertiary"
          size="small"
          onClick={handleCustomToggle}
          isPressed={showCustom}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="m19 7.5h-7.628c-.3089-.87389-1.1423-1.5-2.122-1.5-.97966 0-1.81309.62611-2.12197 1.5h-2.12803v1.5h2.12803c.30888.87389 1.14231 1.5 2.12197 1.5.9797 0 1.8131-.62611 2.122-1.5h7.628z"></path>
              <path d="m19 15h-2.128c-.3089-.8739-1.1423-1.5-2.122-1.5s-1.8131.6261-2.122 1.5h-7.628v1.5h7.628c.3089.8739 1.1423 1.5 2.122 1.5s1.8131-.6261 2.122-1.5h2.128z"></path>
            </svg>
          }
          aria-label={__("Set custom size", "kotlinskidev")}
          style={{ minWidth: "2.25rem", height: "2.25rem" }}
        />
      </div>
    </div>
  );
};

interface ResponsiveFontSizeControlProps {
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

const ResponsiveFontSizeInlineControl: React.FC<ResponsiveFontSizeControlProps> = ({
  attributes,
  setAttributes,
}) => {
  const { responsiveFontSize = {} } = attributes;
  const [isExpanded, setIsExpanded] = useState(false);
  const breakpointLabels = getBreakpointLabels();

  const themeFontSizes = useSelect<ThemeFontSize[]>(
    (select) =>
      (select(blockEditorStore).getSettings() as { fontSizes?: ThemeFontSize[] }).fontSizes ?? [],
    []
  );
  const fontSizeOptions = buildFontSizeOptions(themeFontSizes);

  const updateResponsiveFontSize = (
    device: ResponsiveFontSizeDevice,
    value: string,
    isCustom = false,
    presetValue?: string,
    customValue?: string
  ) => {
    const customKey = `${device}Custom` as keyof ResponsiveFontSize;
    const presetKey = `${device}Preset` as keyof ResponsiveFontSize;
    const customValueKey = `${device}CustomValue` as keyof ResponsiveFontSize;

    const finalCustomValue = isCustom
      ? customValue || value
      : customValue || responsiveFontSize[customValueKey] || "1rem";

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

  const hasValues = Boolean(
    responsiveFontSize.mobile || responsiveFontSize.tablet || responsiveFontSize.desktop
  );

  return (
    <div style={{ marginTop: "1rem", gridColumn: "1 / -1", width: "100%" }}>
      <Button
        variant="tertiary"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
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
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem" }}>📱</span>
          {__("Responsive font size", "kotlinskidev")}
          {hasValues && (
            <span
              style={{
                width: "0.375rem",
                height: "0.375rem",
                borderRadius: "50%",
                backgroundColor: "#007cba",
                display: "inline-block",
              }}
            />
          )}
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

      {isExpanded && (
        <div style={{ paddingTop: "1rem", paddingBottom: "0.5rem", width: "100%" }}>
          <BreakpointControl
            label={__("Mobile", "kotlinskidev")}
            icon="📱"
            breakpointText={`(${breakpointLabels.mobile})`}
            value={responsiveFontSize.mobile || ""}
            isCustom={responsiveFontSize.mobileCustom || false}
            presetValue={responsiveFontSize.mobilePreset || ""}
            customValue={responsiveFontSize.mobileCustomValue || responsiveFontSize.mobile || "1rem"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) =>
              updateResponsiveFontSize("mobile", value, isCustom, presetValue, customValue)
            }
          />

          <BreakpointControl
            label={__("Tablet", "kotlinskidev")}
            icon="📱"
            breakpointText={`(${breakpointLabels.tablet})`}
            value={responsiveFontSize.tablet || ""}
            isCustom={responsiveFontSize.tabletCustom || false}
            presetValue={responsiveFontSize.tabletPreset || ""}
            customValue={responsiveFontSize.tabletCustomValue || responsiveFontSize.tablet || "1rem"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) =>
              updateResponsiveFontSize("tablet", value, isCustom, presetValue, customValue)
            }
          />

          <BreakpointControl
            label={__("Desktop", "kotlinskidev")}
            icon="🖥️"
            breakpointText={`(${breakpointLabels.desktop})`}
            value={responsiveFontSize.desktop || ""}
            isCustom={responsiveFontSize.desktopCustom || false}
            presetValue={responsiveFontSize.desktopPreset || ""}
            customValue={responsiveFontSize.desktopCustomValue || responsiveFontSize.desktop || "1rem"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) =>
              updateResponsiveFontSize("desktop", value, isCustom, presetValue, customValue)
            }
          />
        </div>
      )}
    </div>
  );
};

const withResponsiveFontSizeControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes, name } = props;

    if (!hasBlockSupport(name, "typography")) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="typography">
          <ResponsiveFontSizeInlineControl attributes={attributes} setAttributes={setAttributes} />
        </InspectorControls>
      </Fragment>
    );
  };
}, "withResponsiveFontSizeControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-font-size-attributes",
  addResponsiveFontSizeAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-font-size-controls",
  withResponsiveFontSizeControls
);
