import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  ToggleControl,
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

type SpacingSide = "top" | "right" | "bottom" | "left";
type SpacingSideValues = Record<SpacingSide, string>;
type ResponsiveSpacingDevice = "desktop" | "tablet" | "mobile";
type SpacingType = "Padding" | "Margin";

const SPACING_SIDES: SpacingSide[] = ["top", "right", "bottom", "left"];
const SPACING_DEVICES: ResponsiveSpacingDevice[] = ["desktop", "tablet", "mobile"];
const SPACING_TYPES: SpacingType[] = ["Padding", "Margin"];

const DEFAULT_SIDE_VALUES: SpacingSideValues = {
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px",
};

const SPACING_UNITS = [
  { value: "px", label: "px" },
  { value: "%", label: "%" },
  { value: "rem", label: "rem" },
  { value: "em", label: "em" },
  { value: "vw", label: "vw" },
  { value: "vh", label: "vh" },
];

type ResponsiveSpacingAttributes = Record<
  `${ResponsiveSpacingDevice}${SpacingType}`,
  SpacingSideValues
>;

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

const addResponsiveSpacingAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  const spacingAttributes: Record<string, unknown> = {};
  SPACING_DEVICES.forEach((device) => {
    SPACING_TYPES.forEach((type) => {
      spacingAttributes[`${device}${type}`] = {
        type: "object",
        default: { ...DEFAULT_SIDE_VALUES },
      };
    });
  });

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      ...spacingAttributes,
    },
  };
};

const hasAnyResponsiveSpacingValue = (
  attributes: Partial<ResponsiveSpacingAttributes>
): boolean => {
  return SPACING_DEVICES.some((device) =>
    SPACING_TYPES.some((type) => {
      const values = attributes[`${device}${type}`];
      return values && SPACING_SIDES.some((side) => values[side] && values[side] !== "0px");
    })
  );
};

interface BlockEditProps {
  attributes: Record<string, unknown> & Partial<ResponsiveSpacingAttributes>;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withResponsiveSpacingControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes } = props;

    const [spacingAdvancedOpen, setSpacingAdvancedOpen] = useState(
      hasAnyResponsiveSpacingValue(attributes)
    );
    const breakpoints = getBreakpoints();

    const updateSpacingSide = (
      device: ResponsiveSpacingDevice,
      type: SpacingType,
      side: SpacingSide,
      value: string
    ) => {
      const attrKey = `${device}${type}` as const;
      const current = (attributes[attrKey] as SpacingSideValues) || DEFAULT_SIDE_VALUES;
      setAttributes({
        [attrKey]: {
          ...current,
          [side]: value || "0px",
        },
      });
    };

    const renderSpacingGroup = (device: ResponsiveSpacingDevice, type: SpacingType) => {
      const attrKey = `${device}${type}` as const;
      const values = (attributes[attrKey] as SpacingSideValues) || DEFAULT_SIDE_VALUES;

      return (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
            {type === "Padding" ? __("Padding", "kotlinskidev") : __("Margin", "kotlinskidev")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {SPACING_SIDES.map((side) => (
              <UnitControl
                key={side}
                label={side.charAt(0).toUpperCase() + side.slice(1)}
                size="small"
                value={values[side]}
                units={SPACING_UNITS}
                min={type === "Padding" ? 0 : undefined}
                onChange={(value: string | undefined) =>
                  updateSpacingSide(device, type, side, value || "0px")
                }
              />
            ))}
          </div>
        </div>
      );
    };

    const renderDeviceControls = (
      device: ResponsiveSpacingDevice,
      label: string,
      helpText: string
    ) => {
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

          {renderSpacingGroup(device, "Padding")}
          {renderSpacingGroup(device, "Margin")}
        </div>
      );
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Responsive Spacing", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Advanced Spacing Settings", "kotlinskidev")}
              checked={spacingAdvancedOpen}
              onChange={setSpacingAdvancedOpen}
              help={__("Configure padding and margin per breakpoint", "kotlinskidev")}
            />

            {spacingAdvancedOpen && (
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
}, "withResponsiveSpacingControls");

const SIDE_TO_CSS_PROPERTY: Record<SpacingType, Record<SpacingSide, string>> = {
  Padding: {
    top: "paddingTop",
    right: "paddingRight",
    bottom: "paddingBottom",
    left: "paddingLeft",
  },
  Margin: {
    top: "marginTop",
    right: "marginRight",
    bottom: "marginBottom",
    left: "marginLeft",
  },
};

const buildResponsiveSpacingPreviewStyle = (
  attributes: Partial<ResponsiveSpacingAttributes> | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!attributes) {
    return style;
  }

  SPACING_TYPES.forEach((type) => {
    const values = attributes[`desktop${type}`];
    if (!values) {
      return;
    }
    SPACING_SIDES.forEach((side) => {
      const value = values[side];
      if (value && value !== "0px") {
        style[SIDE_TO_CSS_PROPERTY[type][side]] = value;
      }
    });
  });

  return style;
};

interface BlockListBlockProps {
  attributes?: Partial<ResponsiveSpacingAttributes>;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withResponsiveSpacingPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const style = buildResponsiveSpacingPreviewStyle(props.attributes);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withResponsiveSpacingPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-spacing-attributes",
  addResponsiveSpacingAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-spacing-controls",
  withResponsiveSpacingControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-spacing-preview",
  withResponsiveSpacingPreview
);
