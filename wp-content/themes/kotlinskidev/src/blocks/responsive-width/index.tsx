import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  ToggleControl,
  SelectControl,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { Fragment, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

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

interface ResponsiveWidthDeviceSettings {
  width?: string;
  maxWidth?: string;
}

interface ResponsiveWidthAttribute {
  desktop: ResponsiveWidthDeviceSettings;
  tablet: ResponsiveWidthDeviceSettings;
  mobile: ResponsiveWidthDeviceSettings;
}

type ResponsiveWidthDevice = keyof ResponsiveWidthAttribute;

const DEFAULT_RESPONSIVE_WIDTH: ResponsiveWidthAttribute = {
  desktop: {},
  tablet: {},
  mobile: {},
};

const WIDTH_UNITS = [
  { value: "px", label: "px", default: 0 },
  { value: "%", label: "%", default: 0 },
  { value: "rem", label: "rem", default: 0 },
  { value: "vw", label: "vw", default: 0 },
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

const WidthValueControl = ({
  label,
  presetLabel,
  value,
  onChange,
}: {
  label: string;
  presetLabel: string;
  value: string;
  onChange: (value: string) => void;
}) => {
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

const getBreakpoints = () => {
  return (
    window.kotlinskidevBreakpoints || {
      mobile_max: 781,
      tablet_min: 782,
      tablet_max: 1023,
      desktop_min: 1024,
    }
  );
};

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addResponsiveWidthAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveWidth: {
        type: "object",
        default: DEFAULT_RESPONSIVE_WIDTH,
      },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & { responsiveWidth?: ResponsiveWidthAttribute };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const hasAnyResponsiveWidthValue = (responsiveWidth: ResponsiveWidthAttribute): boolean => {
  return (["desktop", "tablet", "mobile"] as ResponsiveWidthDevice[]).some((device) => {
    const settings = responsiveWidth[device] || {};
    return Boolean(settings.width) || Boolean(settings.maxWidth);
  });
};

const withResponsiveWidthControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const responsiveWidth = attributes.responsiveWidth || DEFAULT_RESPONSIVE_WIDTH;

    const [widthAdvancedOpen, setWidthAdvancedOpen] = useState(
      hasAnyResponsiveWidthValue(responsiveWidth)
    );
    const breakpoints = getBreakpoints();

    const updateResponsiveWidth = (
      device: ResponsiveWidthDevice,
      property: keyof ResponsiveWidthDeviceSettings,
      value: string
    ) => {
      setAttributes({
        responsiveWidth: {
          ...responsiveWidth,
          [device]: {
            ...responsiveWidth[device],
            [property]: value,
          },
        },
      });
    };

    const renderDeviceControls = (
      device: ResponsiveWidthDevice,
      label: string,
      helpText: string
    ) => {
      const deviceSettings = responsiveWidth[device] || {};

      return (
        <div
          key={device}
          style={{
            marginBottom: "1.25rem",
            padding: "0.9375rem",
            border: "0.0625rem solid #ddd",
            borderRadius: "0.25rem",
          }}
        >
          <h4 style={{ margin: "0 0 0.9375rem 0", fontSize: "0.875rem", fontWeight: "600" }}>
            {label}
          </h4>
          <p style={{ fontSize: "0.75rem", color: "#666", margin: "0 0 0.9375rem 0" }}>
            {helpText}
          </p>

          <WidthValueControl
            label={__("Width", "kotlinskidev")}
            presetLabel={__("Width preset", "kotlinskidev")}
            value={deviceSettings.width || ""}
            onChange={(value) => updateResponsiveWidth(device, "width", value)}
          />

          <WidthValueControl
            label={__("Max Width", "kotlinskidev")}
            presetLabel={__("Max width preset", "kotlinskidev")}
            value={deviceSettings.maxWidth || ""}
            onChange={(value) => updateResponsiveWidth(device, "maxWidth", value)}
          />
        </div>
      );
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Responsive Width", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Advanced Width Settings", "kotlinskidev")}
              checked={widthAdvancedOpen}
              onChange={setWidthAdvancedOpen}
              help={__("Configure width and max-width per breakpoint", "kotlinskidev")}
            />

            {widthAdvancedOpen && (
              <>
                {renderDeviceControls(
                  "desktop",
                  __("Desktop", "kotlinskidev"),
                  sprintf(
                    // translators: %s: breakpoint value in rem
                    __("Settings for screens %srem and above", "kotlinskidev"),
                    breakpoints.desktop_min / 16
                  )
                )}

                {renderDeviceControls(
                  "tablet",
                  __("Tablet", "kotlinskidev"),
                  sprintf(
                    // translators: %1$s: minimum breakpoint in rem, %2$s: maximum breakpoint in rem
                    __("Settings for screens %1$srem - %2$srem", "kotlinskidev"),
                    breakpoints.tablet_min / 16,
                    breakpoints.tablet_max / 16
                  )
                )}

                {renderDeviceControls(
                  "mobile",
                  __("Mobile", "kotlinskidev"),
                  sprintf(
                    // translators: %s: breakpoint value in rem
                    __("Settings for screens below %srem", "kotlinskidev"),
                    (breakpoints.mobile_max + 1) / 16
                  )
                )}
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withResponsiveWidthControls");

const buildResponsiveWidthStyle = (
  responsiveWidth: ResponsiveWidthAttribute | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!responsiveWidth) {
    return style;
  }

  (["desktop", "tablet", "mobile"] as ResponsiveWidthDevice[]).forEach((device) => {
    const settings = responsiveWidth[device] || {};
    if (settings.width) {
      style[`--kt-width-${device}`] = settings.width;
    }
    if (settings.maxWidth) {
      style[`--kt-max-width-${device}`] = settings.maxWidth;
    }
  });

  return style;
};

interface BlockListBlockProps {
  attributes?: { responsiveWidth?: ResponsiveWidthAttribute };
  className?: string;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withResponsiveWidthPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const responsiveWidth = props.attributes?.responsiveWidth;
    const style = buildResponsiveWidthStyle(responsiveWidth);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} kt-has-responsive-width`.trim()}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withResponsiveWidthPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-width-attributes",
  addResponsiveWidthAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-width-controls",
  withResponsiveWidthControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-width-preview",
  withResponsiveWidthPreview
);
