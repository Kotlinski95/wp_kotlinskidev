import React from "react";
import { PanelBody, SelectControl, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
  DEFAULT_NAV_GAP,
  MAX_NAV_GAP_PX,
  NAV_GAP_DEVICES,
  type ContentTabsAttributes,
  type ContentTabsSettingsProps,
  type NavGap,
  type NavGapDevice,
} from "./content-tabs-attributes";

const NAV_POSITION_OPTIONS = [
  { label: __("Top", "kotlinskidev"), value: "top" },
  { label: __("Bottom", "kotlinskidev"), value: "bottom" },
  { label: __("Left", "kotlinskidev"), value: "left" },
  { label: __("Right", "kotlinskidev"), value: "right" },
];

const NAV_POSITION_MOBILE_OPTIONS = [
  { label: __("Top", "kotlinskidev"), value: "top" },
  { label: __("Bottom", "kotlinskidev"), value: "bottom" },
];

const NAV_GAP_DEVICE_LABELS: Record<NavGapDevice, string> = {
  desktop: __("Desktop", "kotlinskidev"),
  tablet: __("Tablet", "kotlinskidev"),
  mobile: __("Mobile", "kotlinskidev"),
};

const NavGapControls = ({ attributes, setAttributes }: ContentTabsSettingsProps) => {
  const resolvedNavGap: NavGap = attributes.navGap || {};
  return (
    <>
      <p className="components-base-control__help">{__("Gap between nav links", "kotlinskidev")}</p>
      {NAV_GAP_DEVICES.map((device) => (
        <RangeControl
          key={device}
          label={NAV_GAP_DEVICE_LABELS[device]}
          value={resolvedNavGap[device] ?? (device === "desktop" ? DEFAULT_NAV_GAP : 0)}
          min={0}
          max={MAX_NAV_GAP_PX}
          allowReset={device !== "desktop"}
          onChange={(value) =>
            setAttributes({
              navGap: {
                ...resolvedNavGap,
                [device]: value ?? (device === "desktop" ? DEFAULT_NAV_GAP : undefined),
              },
            })
          }
        />
      ))}
    </>
  );
};

export const PositionPanel = ({ attributes, setAttributes }: ContentTabsSettingsProps) => (
  <PanelBody title={__("Content Tabs Settings", "kotlinskidev")}>
    <SelectControl
      label={__("Desktop position", "kotlinskidev")}
      value={attributes.navPosition}
      options={NAV_POSITION_OPTIONS}
      onChange={(value) =>
        setAttributes({ navPosition: value as ContentTabsAttributes["navPosition"] })
      }
    />
    <SelectControl
      label={__("Mobile position", "kotlinskidev")}
      value={attributes.navPositionMobile}
      options={NAV_POSITION_MOBILE_OPTIONS}
      help={__(
        "Below the mobile breakpoint, the nav switches to this position and scrolls horizontally on one line instead of wrapping.",
        "kotlinskidev"
      )}
      onChange={(value) =>
        setAttributes({
          navPositionMobile: value as ContentTabsAttributes["navPositionMobile"],
        })
      }
    />
    <NavGapControls attributes={attributes} setAttributes={setAttributes} />
  </PanelBody>
);
