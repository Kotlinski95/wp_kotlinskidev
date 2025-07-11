/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  Flex,
  FlexItem,
  BaseControl,
  Button,
  RangeControl,
  ToggleControl,
} from "@wordpress/components";
import { hasBlockSupport } from "@wordpress/blocks";
import * as React from "react";
import "./style.scss";

/**
 * Internal dependencies
 */
import "./editor.scss";

/**
 * Types
 */
interface FontSizeOption {
  label: string;
  value: string;
  slug?: string;
}

interface ResponsiveFontSize {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  mobileCustom?: boolean;
  tabletCustom?: boolean;
  desktopCustom?: boolean;
  // Store preset values separately
  mobilePreset?: string;
  tabletPreset?: string;
  desktopPreset?: string;
  // Store custom values separately
  mobileCustomValue?: string;
  tabletCustomValue?: string;
  desktopCustomValue?: string;
}

interface BlockAttributes {
  responsiveFontSize?: ResponsiveFontSize;
  [key: string]: any;
}

interface ResponsiveFontSizeControlProps {
  attributes: BlockAttributes;
  setAttributes: (attributes: Partial<BlockAttributes>) => void;
}

interface BlockEditProps {
  attributes: BlockAttributes;
  setAttributes: (attributes: Partial<BlockAttributes>) => void;
  name: string;
  [key: string]: any;
}

interface BlockSettings {
  attributes?: { [key: string]: any };
  supports?: { [key: string]: any };
  [key: string]: any;
}

/**
 * Get font sizes from theme.json or use defaults
 */
const getFontSizeOptions = (): FontSizeOption[] => {
  // Default font sizes based on your theme.json
  const defaultFontSizes: FontSizeOption[] = [
    {
      label: __("Extra Small", "responsive-font-controls"),
      value: "12px",
      slug: "x-small",
    },
    {
      label: __("Small", "responsive-font-controls"),
      value: "14px",
      slug: "small",
    },
    {
      label: __("Normal", "responsive-font-controls"),
      value: "16px",
      slug: "normal",
    },
    {
      label: __("Medium", "responsive-font-controls"),
      value: "20px",
      slug: "medium",
    },
    {
      label: __("Big", "responsive-font-controls"),
      value: "24px",
      slug: "big",
    },
    {
      label: __("Large", "responsive-font-controls"),
      value: "32px",
      slug: "large",
    },
    {
      label: __("Extra Large", "responsive-font-controls"),
      value: "40px",
      slug: "x-large",
    },
    {
      label: __("XX Large", "responsive-font-controls"),
      value: "48px",
      slug: "xx-large",
    },
    {
      label: __("XXX Large", "responsive-font-controls"),
      value: "64px",
      slug: "xxx-large",
    },
  ];

  // Convert to options format for SelectControl
  const options: FontSizeOption[] = [
    { label: __("Default", "responsive-font-controls"), value: "" },
    ...defaultFontSizes.map((size) => ({
      label: size.label,
      value: size.value,
    })),
  ];

  return options;
};

/**
 * Responsive Font Size Control Component
 */
const ResponsiveFontSizeControl: React.FC<ResponsiveFontSizeControlProps> = ({
  attributes,
  setAttributes,
}) => {
  const { responsiveFontSize = {} } = attributes;
  const fontSizeOptions = getFontSizeOptions();

  const updateResponsiveFontSize = (
    device: keyof ResponsiveFontSize,
    value: string
  ) => {
    setAttributes({
      responsiveFontSize: {
        ...responsiveFontSize,
        [device]: value,
      },
    });
  };

  return (
    <PanelBody
      title={__("Responsive Font Size", "responsive-font-controls")}
      initialOpen={false}
    >
      <BaseControl>
        {__(
          "Set different font sizes for different screen sizes. Leave empty to use the default font size.",
          "responsive-font-controls"
        )}
      </BaseControl>

      {/* Mobile Font Size */}
      <Flex gap={3} align="flex-start">
        <FlexItem style={{ minWidth: "80px" }}>
          <BaseControl>
            <strong>📱 {__("Mobile", "responsive-font-controls")}</strong>
            <br />
            <small style={{ color: "#666" }}>
              {__("< 768px", "responsive-font-controls")}
            </small>
          </BaseControl>
        </FlexItem>
        <FlexItem>
          <SelectControl
            value={responsiveFontSize.mobile || ""}
            options={fontSizeOptions}
            onChange={(value: string) =>
              updateResponsiveFontSize("mobile", value)
            }
          />
        </FlexItem>
      </Flex>

      {/* Tablet Font Size */}
      <Flex gap={3} align="flex-start">
        <FlexItem style={{ minWidth: "80px" }}>
          <BaseControl>
            <strong>📱 {__("Tablet", "responsive-font-controls")}</strong>
            <br />
            <small style={{ color: "#666" }}>
              {__("768px - 1023px", "responsive-font-controls")}
            </small>
          </BaseControl>
        </FlexItem>
        <FlexItem>
          <SelectControl
            value={responsiveFontSize.tablet || ""}
            options={fontSizeOptions}
            onChange={(value: string) =>
              updateResponsiveFontSize("tablet", value)
            }
          />
        </FlexItem>
      </Flex>

      {/* Desktop Font Size */}
      <Flex gap={3} align="flex-start">
        <FlexItem style={{ minWidth: "80px" }}>
          <BaseControl>
            <strong>🖥️ {__("Desktop", "responsive-font-controls")}</strong>
            <br />
            <small style={{ color: "#666" }}>
              {__("≥ 1024px", "responsive-font-controls")}
            </small>
          </BaseControl>
        </FlexItem>
        <FlexItem>
          <SelectControl
            value={responsiveFontSize.desktop || ""}
            options={fontSizeOptions}
            onChange={(value: string) =>
              updateResponsiveFontSize("desktop", value)
            }
          />
        </FlexItem>
      </Flex>
    </PanelBody>
  );
};

/**
 * Add responsive font size attribute to supported blocks
 */
const addResponsiveFontSizeAttribute = (
  settings: BlockSettings
): BlockSettings => {
  // Only add to blocks that support typography
  if (settings.supports && settings.supports.typography) {
    // Add responsive font size support
    if (!settings.supports) {
      settings.supports = {};
    }
    settings.supports.responsiveFontSize = true;

    // Add the attribute
    settings.attributes = {
      ...settings.attributes,
      responsiveFontSize: {
        type: "object",
        default: {},
      },
    };
  }

  return settings;
};

/**
 * Individual breakpoint control with custom size option
 */
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
  customValue = "16px",
  fontSizeOptions,
  onChange,
}) => {
  const [showCustom, setShowCustom] = React.useState(isCustom);
  
  // Debug: Log what values we're receiving
  React.useEffect(() => {
    console.log(`${label} BreakpointControl:`, {
      value,
      isCustom,
      presetValue,
      customValue,
      showCustom
    });
  }, [label, value, isCustom, presetValue, customValue, showCustom]);
  
  // Sync local state with prop when isCustom changes (e.g., after page refresh)
  React.useEffect(() => {
    setShowCustom(isCustom);
  }, [isCustom]);
  
  // Parse current value to get numeric value for range control
  const getNumericValue = (val: string): number => {
    if (!val) return 16;
    const match = val.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 16;
  };

  // Determine what value to show based on current mode
  const getDisplayValue = () => {
    if (showCustom) {
      // In custom mode: use customValue if available, otherwise fall back to value, then 16px
      return customValue || value || "16px";
    } else {
      // In preset mode: use presetValue if available, otherwise fall back to value
      return presetValue || value || "";
    }
  };

  const handlePresetChange = (newValue: string) => {
    setShowCustom(false);
    // Pass the new preset value and keep the current custom value
    onChange(newValue, false, newValue, customValue);
  };

  const handleCustomToggle = () => {
    const newShowCustom = !showCustom;
    setShowCustom(newShowCustom);
    if (newShowCustom) {
      // Switch to custom mode - use stored custom value or current value as fallback
      const valueToUse = customValue || value || "16px";
      onChange(valueToUse, true, presetValue, valueToUse);
    } else {
      // Switch to preset mode - use stored preset value or empty as fallback
      const valueToUse = presetValue || "";
      onChange(valueToUse, false, valueToUse, customValue);
    }
  };

  const handleCustomChange = (newSize: number | undefined) => {
    if (typeof newSize === 'number') {
      const newCustomValue = `${newSize}px`;
      // Update the custom value and keep the current preset value
      onChange(newCustomValue, true, presetValue, newCustomValue);
    }
  };

  const displayValue = getDisplayValue();

  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: '8px', 
        fontSize: '11px', 
        fontWeight: '500', 
        textTransform: 'uppercase', 
        color: '#757575',
        gap: '6px'
      }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        {label}
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          {breakpointText}
        </span>
      </label>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {showCustom ? (
            <RangeControl
              value={getNumericValue(displayValue)}
              onChange={handleCustomChange}
              min={8}
              max={100}
              step={0.5}
              __nextHasNoMarginBottom
              withInputField={true}
              help={`${getNumericValue(displayValue)}px`}
            />
          ) : (
            <SelectControl
              value={displayValue}
              options={fontSizeOptions}
              onChange={handlePresetChange}
              __nextHasNoMarginBottom
              style={{ width: '100%' }}
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
          aria-label={__("Set custom size", "responsive-font-controls")}
          style={{ minWidth: '36px', height: '36px' }}
        />
      </div>
    </div>
  );
};

/**
 * Get breakpoint values from plugin settings
 */
const getBreakpoints = () => {
  // Get breakpoints from plugin settings passed via wp_localize_script
  const settings = (window as any).responsiveFontControlsSettings;
  
  if (settings) {
    return {
      tablet: settings.tabletBreakpoint + 'px',
      desktop: settings.desktopBreakpoint + 'px'
    };
  }
  
  // Fallback to defaults if settings not available
  return {
    tablet: '768px',
    desktop: '1024px'
  };
};

/**
 * Simplified Responsive Font Size Control for Typography Panel
 */
const ResponsiveFontSizeInlineControl: React.FC<ResponsiveFontSizeControlProps> = ({
  attributes,
  setAttributes,
}) => {
  const { responsiveFontSize = {} } = attributes;
  const fontSizeOptions = getFontSizeOptions();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const breakpoints = getBreakpoints();

  // Debug: Log what we're getting from attributes
  React.useEffect(() => {
    console.log('ResponsiveFontSize attributes:', responsiveFontSize);
  }, [responsiveFontSize]);

  const updateResponsiveFontSize = (
    device: keyof ResponsiveFontSize,
    value: string,
    isCustom = false,
    presetValue?: string,
    customValue?: string
  ) => {
    const customKey = `${device}Custom` as keyof ResponsiveFontSize;
    const presetKey = `${device}Preset` as keyof ResponsiveFontSize;
    const customValueKey = `${device}CustomValue` as keyof ResponsiveFontSize;
    
    // If we're in custom mode and no customValue is provided, use the main value
    const finalCustomValue = isCustom ? (customValue || value) : (customValue || responsiveFontSize[customValueKey] || "16px");
    
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

  const hasValues = responsiveFontSize.mobile || responsiveFontSize.tablet || responsiveFontSize.desktop;

  return (
    <div style={{ marginTop: '16px', gridColumn: '1 / -1', width: '100%' }}>
      {/* Accordion Header */}
      <Button
        variant="tertiary"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '8px 0',
          border: 'none',
          borderRadius: '0',
          borderBottom: '1px solid #ddd',
          background: 'transparent',
          fontSize: '13px',
          fontWeight: '500',
          color: '#1e1e1e',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📱</span>
          {__("Responsive font size", "responsive-font-controls")}
          {hasValues && (
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: '#007cba',
              display: 'inline-block'
            }} />
          )}
        </span>
        <span style={{ 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '12px'
        }}>
          ▼
        </span>
      </Button>

      {/* Accordion Content */}
      {isExpanded && (
        <div style={{ 
          paddingTop: '16px',
          paddingBottom: '8px',
          width: '100%'
        }}>
          {/* Mobile Font Size */}
          <BreakpointControl
            label={__("Mobile", "responsive-font-controls")}
            icon="📱"
            breakpointText={`(< ${breakpoints.tablet})`}
            value={responsiveFontSize.mobile || ""}
            isCustom={responsiveFontSize.mobileCustom || false}
            presetValue={responsiveFontSize.mobilePreset || ""}
            customValue={responsiveFontSize.mobileCustomValue || responsiveFontSize.mobile || "16px"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) => updateResponsiveFontSize("mobile", value, isCustom, presetValue, customValue)}
          />

          {/* Tablet Font Size */}
          <BreakpointControl
            label={__("Tablet", "responsive-font-controls")}
            icon="📱"
            breakpointText={`(${breakpoints.tablet} - ${breakpoints.desktop})`}
            value={responsiveFontSize.tablet || ""}
            isCustom={responsiveFontSize.tabletCustom || false}
            presetValue={responsiveFontSize.tabletPreset || ""}
            customValue={responsiveFontSize.tabletCustomValue || responsiveFontSize.tablet || "16px"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) => updateResponsiveFontSize("tablet", value, isCustom, presetValue, customValue)}
          />

          {/* Desktop Font Size */}
          <BreakpointControl
            label={__("Desktop", "responsive-font-controls")}
            icon="🖥️"
            breakpointText={`(≥ ${breakpoints.desktop})`}
            value={responsiveFontSize.desktop || ""}
            isCustom={responsiveFontSize.desktopCustom || false}
            presetValue={responsiveFontSize.desktopPreset || ""}
            customValue={responsiveFontSize.desktopCustomValue || responsiveFontSize.desktop || "16px"}
            fontSizeOptions={fontSizeOptions}
            onChange={(value, isCustom, presetValue, customValue) => updateResponsiveFontSize("desktop", value, isCustom, presetValue, customValue)}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Add responsive font size controls to typography panel
 */
const withResponsiveFontSizeControls = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps>) => {
    return (props: BlockEditProps) => {
      const { attributes, setAttributes, name } = props;

      // Only show controls for blocks that support typography
      if (!hasBlockSupport(name, "typography")) {
        return <BlockEdit {...props} />;
      }

      return (
        <Fragment>
          <BlockEdit {...props} />
          <InspectorControls group="typography">
            <ResponsiveFontSizeInlineControl
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </InspectorControls>
        </Fragment>
      );
    };
  },
  "withResponsiveFontSizeControls"
);

/**
 * Register filters
 */
addFilter(
  "blocks.registerBlockType",
  "responsive-font-controls/add-attributes",
  addResponsiveFontSizeAttribute
);

addFilter(
  "editor.BlockEdit",
  "responsive-font-controls/with-responsive-font-size-controls",
  withResponsiveFontSizeControls
);
