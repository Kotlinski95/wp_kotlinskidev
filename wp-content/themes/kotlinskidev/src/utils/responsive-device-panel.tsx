import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import type { ReactNode } from "react";
import { getBreakpoints } from "./responsive-breakpoints";
import type { ResponsiveDevice } from "./responsive-breakpoints";

const REM_BASE_PX = 16;

const DEVICE_CARD_STYLE = {
  marginBottom: "1.25rem",
  padding: "0.9375rem",
  border: "0.0625rem solid #ddd",
  borderRadius: "0.25rem",
};

const DEVICE_TITLE_STYLE = { margin: "0 0 0.9375rem 0", fontSize: "0.875rem", fontWeight: "600" };

const DEVICE_HELP_STYLE = { fontSize: "0.75rem", color: "#666", margin: "0 0 0.9375rem 0" };

interface DeviceSettingsCardProps {
  label: string;
  helpText: string;
  children: ReactNode;
}

export const DeviceSettingsCard = ({ label, helpText, children }: DeviceSettingsCardProps) => (
  <div style={DEVICE_CARD_STYLE}>
    <h4 style={DEVICE_TITLE_STYLE}>{label}</h4>
    <p style={DEVICE_HELP_STYLE}>{helpText}</p>
    {children}
  </div>
);

export type RenderDeviceControls = (
  device: ResponsiveDevice,
  label: string,
  helpText: string
) => ReactNode;

const renderEveryDevice = (renderDeviceControls: RenderDeviceControls) => {
  const breakpoints = getBreakpoints();

  return (
    <>
      {renderDeviceControls(
        "desktop",
        __("Desktop", "kotlinskidev"),
        sprintf(
          // translators: %s: breakpoint value in rem
          __("Settings for screens %srem and above", "kotlinskidev"),
          breakpoints.desktop_min / REM_BASE_PX
        )
      )}

      {renderDeviceControls(
        "tablet",
        __("Tablet", "kotlinskidev"),
        sprintf(
          // translators: %1$s: minimum breakpoint in rem, %2$s: maximum breakpoint in rem
          __("Settings for screens %1$srem - %2$srem", "kotlinskidev"),
          breakpoints.tablet_min / REM_BASE_PX,
          breakpoints.tablet_max / REM_BASE_PX
        )
      )}

      {renderDeviceControls(
        "mobile",
        __("Mobile", "kotlinskidev"),
        sprintf(
          // translators: %s: breakpoint value in rem
          __("Settings for screens below %srem", "kotlinskidev"),
          (breakpoints.mobile_max + 1) / REM_BASE_PX
        )
      )}
    </>
  );
};

interface AdvancedDevicePanelProps {
  panelTitle: string;
  toggleLabel: string;
  toggleHelp: string;
  isAdvancedOpen: boolean;
  onToggleAdvanced: (isOpen: boolean) => void;
  renderDeviceControls: RenderDeviceControls;
}

export const AdvancedDevicePanel = ({
  panelTitle,
  toggleLabel,
  toggleHelp,
  isAdvancedOpen,
  onToggleAdvanced,
  renderDeviceControls,
}: AdvancedDevicePanelProps) => (
  <InspectorControls>
    <PanelBody title={panelTitle} initialOpen={false}>
      <ToggleControl
        label={toggleLabel}
        checked={isAdvancedOpen}
        onChange={onToggleAdvanced}
        help={toggleHelp}
      />

      {isAdvancedOpen && renderEveryDevice(renderDeviceControls)}
    </PanelBody>
  </InspectorControls>
);
