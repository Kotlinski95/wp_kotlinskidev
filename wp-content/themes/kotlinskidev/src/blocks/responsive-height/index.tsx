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

interface ResponsiveHeightDeviceSettings {
  minHeight?: string;
}

interface ResponsiveHeightAttribute {
  desktop: ResponsiveHeightDeviceSettings;
  tablet: ResponsiveHeightDeviceSettings;
  mobile: ResponsiveHeightDeviceSettings;
}

type ResponsiveHeightDevice = keyof ResponsiveHeightAttribute;

const DEFAULT_RESPONSIVE_HEIGHT: ResponsiveHeightAttribute = {
  desktop: {},
  tablet: {},
  mobile: {},
};

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

const HeightValueControl = ({
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

const addResponsiveHeightAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveHeight: {
        type: "object",
        default: DEFAULT_RESPONSIVE_HEIGHT,
      },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & { responsiveHeight?: ResponsiveHeightAttribute };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const hasAnyResponsiveHeightValue = (responsiveHeight: ResponsiveHeightAttribute): boolean => {
  return (["desktop", "tablet", "mobile"] as ResponsiveHeightDevice[]).some((device) => {
    const settings = responsiveHeight[device] || {};
    return Boolean(settings.minHeight);
  });
};

const withResponsiveHeightControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const responsiveHeight = attributes.responsiveHeight || DEFAULT_RESPONSIVE_HEIGHT;

    const [heightAdvancedOpen, setHeightAdvancedOpen] = useState(
      hasAnyResponsiveHeightValue(responsiveHeight)
    );
    const breakpoints = getBreakpoints();

    const updateResponsiveHeight = (device: ResponsiveHeightDevice, value: string) => {
      setAttributes({
        responsiveHeight: {
          ...responsiveHeight,
          [device]: {
            ...responsiveHeight[device],
            minHeight: value,
          },
        },
      });
    };

    const renderDeviceControls = (
      device: ResponsiveHeightDevice,
      label: string,
      helpText: string
    ) => {
      const deviceSettings = responsiveHeight[device] || {};

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

          <HeightValueControl
            label={__("Min Height", "kotlinskidev")}
            presetLabel={__("Min height preset", "kotlinskidev")}
            value={deviceSettings.minHeight || ""}
            onChange={(value) => updateResponsiveHeight(device, value)}
          />
        </div>
      );
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Responsive Min Height", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Advanced Min Height Settings", "kotlinskidev")}
              checked={heightAdvancedOpen}
              onChange={setHeightAdvancedOpen}
              help={__("Configure min-height per breakpoint", "kotlinskidev")}
            />

            {heightAdvancedOpen && (
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
}, "withResponsiveHeightControls");

const buildResponsiveHeightStyle = (
  responsiveHeight: ResponsiveHeightAttribute | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!responsiveHeight) {
    return style;
  }

  (["desktop", "tablet", "mobile"] as ResponsiveHeightDevice[]).forEach((device) => {
    const settings = responsiveHeight[device] || {};
    if (settings.minHeight) {
      style[`--kt-min-height-${device}`] = settings.minHeight;
    }
  });

  return style;
};

const buildResponsiveHeightClasses = (
  responsiveHeight: ResponsiveHeightAttribute | undefined
): string[] => {
  const classes: string[] = [];

  if (!responsiveHeight) {
    return classes;
  }

  let inherited = "";
  (["desktop", "tablet", "mobile"] as ResponsiveHeightDevice[]).forEach((device) => {
    const settings = responsiveHeight[device] || {};
    inherited = settings.minHeight || inherited;

    if (inherited) {
      classes.push(`kt-has-responsive-height-${device}`);
    }
  });

  return classes;
};

interface BlockListBlockProps {
  attributes?: { responsiveHeight?: ResponsiveHeightAttribute };
  className?: string;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withResponsiveHeightPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const responsiveHeight = props.attributes?.responsiveHeight;
    const style = buildResponsiveHeightStyle(responsiveHeight);
    const classes = buildResponsiveHeightClasses(responsiveHeight);

    if (Object.keys(style).length === 0 || classes.length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} ${classes.join(" ")}`.trim()}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withResponsiveHeightPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-height-attributes",
  addResponsiveHeightAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-height-controls",
  withResponsiveHeightControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-height-preview",
  withResponsiveHeightPreview
);
