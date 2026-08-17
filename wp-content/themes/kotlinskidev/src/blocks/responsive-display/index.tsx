import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { Fragment, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";

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

const displayOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Block", "kotlinskidev"), value: "block" },
  { label: __("Flex", "kotlinskidev"), value: "flex" },
  { label: __("Grid", "kotlinskidev"), value: "grid" },
  { label: __("None (hidden)", "kotlinskidev"), value: "none" },
];

const flexDirectionOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Row", "kotlinskidev"), value: "flex-row" },
  { label: __("Column", "kotlinskidev"), value: "flex-column" },
];

const justifyContentOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "justify-content-center" },
  { label: __("Start", "kotlinskidev"), value: "justify-content-start" },
  { label: __("End", "kotlinskidev"), value: "justify-content-end" },
  { label: __("Space Between", "kotlinskidev"), value: "justify-content-space-between" },
  { label: __("Space Around", "kotlinskidev"), value: "justify-content-space-around" },
  { label: __("Space Evenly", "kotlinskidev"), value: "justify-content-space-evenly" },
];

const alignItemsOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "align-items-center" },
  { label: __("Start", "kotlinskidev"), value: "align-items-start" },
  { label: __("End", "kotlinskidev"), value: "align-items-end" },
];

const justifySelfOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "justify-self-center" },
  { label: __("Start", "kotlinskidev"), value: "justify-self-start" },
  { label: __("End", "kotlinskidev"), value: "justify-self-end" },
  { label: __("Stretch", "kotlinskidev"), value: "justify-self-stretch" },
  { label: __("Baseline", "kotlinskidev"), value: "justify-self-baseline" },
];

const alignSelfOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "align-self-center" },
  { label: __("Start", "kotlinskidev"), value: "align-self-start" },
  { label: __("End", "kotlinskidev"), value: "align-self-end" },
  { label: __("Stretch", "kotlinskidev"), value: "align-self-stretch" },
];

const addResponsiveDisplayAttributes = (settings: any) => {
  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveDisplay: {
        type: "object",
        default: {
          desktop: {},
          tablet: {},
          mobile: {},
        },
      },
    },
  };
};

const withResponsiveDisplayControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes } = props;
    const { responsiveDisplay = { desktop: {}, tablet: {}, mobile: {} } } = attributes;

    const hasResponsiveSettings = () => {
      const checkDevice = (device: any) => {
        return device && Object.values(device).some((value: any) => value && value !== "");
      };
      return (
        checkDevice(responsiveDisplay.desktop) ||
        checkDevice(responsiveDisplay.tablet) ||
        checkDevice(responsiveDisplay.mobile)
      );
    };

    const [displayAdvancedOpen, setDisplayAdvancedOpen] = useState(hasResponsiveSettings());
    const breakpoints = getBreakpoints();

    const updateResponsiveDisplay = (device: string, property: string, value: string) => {
      setAttributes({
        responsiveDisplay: {
          ...responsiveDisplay,
          [device]: {
            ...responsiveDisplay[device],
            [property]: value,
          },
        },
      });
    };

    const renderDeviceControls = (device: string, label: string, helpText: string) => {
      const deviceSettings = responsiveDisplay[device] || {};

      return (
        <div
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

          <SelectControl
            label={__("Display", "kotlinskidev")}
            value={deviceSettings.display || ""}
            options={displayOptions}
            onChange={(value: string) => updateResponsiveDisplay(device, "display", value)}
          />

          {deviceSettings.display === "flex" && (
            <SelectControl
              label={__("Flex Direction", "kotlinskidev")}
              value={deviceSettings.flexDirection || ""}
              options={flexDirectionOptions}
              onChange={(value: string) => updateResponsiveDisplay(device, "flexDirection", value)}
            />
          )}

          {(deviceSettings.display === "flex" || deviceSettings.display === "grid") && (
            <>
              <SelectControl
                label={__("Justify Content", "kotlinskidev")}
                value={deviceSettings.justifyContent || ""}
                options={justifyContentOptions}
                onChange={(value: string) =>
                  updateResponsiveDisplay(device, "justifyContent", value)
                }
              />

              <SelectControl
                label={__("Align Items", "kotlinskidev")}
                value={deviceSettings.alignItems || ""}
                options={alignItemsOptions}
                onChange={(value: string) => updateResponsiveDisplay(device, "alignItems", value)}
              />
            </>
          )}

          <SelectControl
            label={__("Justify Self", "kotlinskidev")}
            value={deviceSettings.justifySelf || ""}
            options={justifySelfOptions}
            onChange={(value: string) => updateResponsiveDisplay(device, "justifySelf", value)}
          />

          <SelectControl
            label={__("Align Self", "kotlinskidev")}
            value={deviceSettings.alignSelf || ""}
            options={alignSelfOptions}
            onChange={(value: string) => updateResponsiveDisplay(device, "alignSelf", value)}
          />
        </div>
      );
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Display & Layout", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Advanced Display Settings", "kotlinskidev")}
              checked={displayAdvancedOpen}
              onChange={setDisplayAdvancedOpen}
              help={__("Configure responsive display, flex, and grid properties", "kotlinskidev")}
            />

            {displayAdvancedOpen && (
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
}, "withResponsiveDisplayControls");

const addResponsiveDisplayClasses = createHigherOrderComponent((BlockListBlock) => {
  return (props: any) => {
    const { attributes } = props;
    const { responsiveDisplay } = attributes;

    let additionalClasses = "";

    if (responsiveDisplay) {
      if (responsiveDisplay.desktop) {
        const desktop = responsiveDisplay.desktop;
        if (desktop.display) {
          additionalClasses += ` desktop:${desktop.display}`;
        }
        if (desktop.flexDirection) {
          additionalClasses += ` desktop:${desktop.flexDirection}`;
        }
        if (desktop.justifyContent) {
          additionalClasses += ` desktop:${desktop.justifyContent}`;
        }
        if (desktop.alignItems) {
          additionalClasses += ` desktop:${desktop.alignItems}`;
        }
        if (desktop.justifySelf) {
          additionalClasses += ` desktop:${desktop.justifySelf}`;
        }
        if (desktop.alignSelf) {
          additionalClasses += ` desktop:${desktop.alignSelf}`;
        }
      }

      if (responsiveDisplay.tablet) {
        const tablet = responsiveDisplay.tablet;
        if (tablet.display) {
          additionalClasses += ` tablet:${tablet.display}`;
        }
        if (tablet.flexDirection) {
          additionalClasses += ` tablet:${tablet.flexDirection}`;
        }
        if (tablet.justifyContent) {
          additionalClasses += ` tablet:${tablet.justifyContent}`;
        }
        if (tablet.alignItems) {
          additionalClasses += ` tablet:${tablet.alignItems}`;
        }
        if (tablet.justifySelf) {
          additionalClasses += ` tablet:${tablet.justifySelf}`;
        }
        if (tablet.alignSelf) {
          additionalClasses += ` tablet:${tablet.alignSelf}`;
        }
      }

      if (responsiveDisplay.mobile) {
        const mobile = responsiveDisplay.mobile;
        if (mobile.display) {
          additionalClasses += ` mobile:${mobile.display}`;
        }
        if (mobile.flexDirection) {
          additionalClasses += ` mobile:${mobile.flexDirection}`;
        }
        if (mobile.justifyContent) {
          additionalClasses += ` mobile:${mobile.justifyContent}`;
        }
        if (mobile.alignItems) {
          additionalClasses += ` mobile:${mobile.alignItems}`;
        }
        if (mobile.justifySelf) {
          additionalClasses += ` mobile:${mobile.justifySelf}`;
        }
        if (mobile.alignSelf) {
          additionalClasses += ` mobile:${mobile.alignSelf}`;
        }
      }
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} ${additionalClasses}`.trim()}
      />
    );
  };
}, "addResponsiveDisplayClasses");

function applyResponsiveDisplayClass(extraProps: any, blockType: any, attributes: any) {
  const { responsiveDisplay } = attributes;

  if (responsiveDisplay) {
    let additionalClasses = "";

    if (responsiveDisplay.desktop) {
      const desktop = responsiveDisplay.desktop;
      if (desktop.display) {
        additionalClasses += ` desktop:${desktop.display}`;
      }
      if (desktop.flexDirection) {
        additionalClasses += ` desktop:${desktop.flexDirection}`;
      }
      if (desktop.justifyContent) {
        additionalClasses += ` desktop:${desktop.justifyContent}`;
      }
      if (desktop.alignItems) {
        additionalClasses += ` desktop:${desktop.alignItems}`;
      }
      if (desktop.justifySelf) {
        additionalClasses += ` desktop:${desktop.justifySelf}`;
      }
      if (desktop.alignSelf) {
        additionalClasses += ` desktop:${desktop.alignSelf}`;
      }
    }

    if (responsiveDisplay.tablet) {
      const tablet = responsiveDisplay.tablet;
      if (tablet.display) {
        additionalClasses += ` tablet:${tablet.display}`;
      }
      if (tablet.flexDirection) {
        additionalClasses += ` tablet:${tablet.flexDirection}`;
      }
      if (tablet.justifyContent) {
        additionalClasses += ` tablet:${tablet.justifyContent}`;
      }
      if (tablet.alignItems) {
        additionalClasses += ` tablet:${tablet.alignItems}`;
      }
      if (tablet.justifySelf) {
        additionalClasses += ` tablet:${tablet.justifySelf}`;
      }
      if (tablet.alignSelf) {
        additionalClasses += ` tablet:${tablet.alignSelf}`;
      }
    }

    if (responsiveDisplay.mobile) {
      const mobile = responsiveDisplay.mobile;
      if (mobile.display) {
        additionalClasses += ` mobile:${mobile.display}`;
      }
      if (mobile.flexDirection) {
        additionalClasses += ` mobile:${mobile.flexDirection}`;
      }
      if (mobile.justifyContent) {
        additionalClasses += ` mobile:${mobile.justifyContent}`;
      }
      if (mobile.alignItems) {
        additionalClasses += ` mobile:${mobile.alignItems}`;
      }
      if (mobile.justifySelf) {
        additionalClasses += ` mobile:${mobile.justifySelf}`;
      }
      if (mobile.alignSelf) {
        additionalClasses += ` mobile:${mobile.alignSelf}`;
      }
    }

    if (additionalClasses) {
      extraProps.className = extraProps.className
        ? `${extraProps.className} ${additionalClasses.trim()}`
        : additionalClasses.trim();
    }
  }

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-display-attributes",
  addResponsiveDisplayAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-display-controls",
  withResponsiveDisplayControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-display-classes",
  addResponsiveDisplayClasses
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/responsive-display-save-classes",
  applyResponsiveDisplayClass
);
