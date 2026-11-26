import React from "react";
import { SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
  FLEX_FAMILY_DISPLAYS,
  FLEX_OR_GRID_FAMILY_DISPLAYS,
  alignItemsOptions,
  alignSelfOptions,
  displayOptions,
  flexDirectionOptions,
  justifyContentOptions,
  justifySelfOptions,
} from "./display-options";
import type { DeviceDisplaySettings, DisplayProperty } from "./display-attribute";

interface DisplayDeviceControlsProps {
  settings: DeviceDisplaySettings;
  onChange: (property: DisplayProperty, value: string) => void;
}

const FlexAndGridControls = ({ settings, onChange }: DisplayDeviceControlsProps) => (
  <>
    {FLEX_FAMILY_DISPLAYS.includes(settings.display as string) && (
      <SelectControl
        label={__("Flex Direction", "kotlinskidev")}
        value={settings.flexDirection || ""}
        options={flexDirectionOptions}
        onChange={(value: string) => onChange("flexDirection", value)}
      />
    )}

    {FLEX_OR_GRID_FAMILY_DISPLAYS.includes(settings.display as string) && (
      <>
        <SelectControl
          label={__("Justify Content", "kotlinskidev")}
          value={settings.justifyContent || ""}
          options={justifyContentOptions}
          onChange={(value: string) => onChange("justifyContent", value)}
        />

        <SelectControl
          label={__("Align Items", "kotlinskidev")}
          value={settings.alignItems || ""}
          options={alignItemsOptions}
          onChange={(value: string) => onChange("alignItems", value)}
        />
      </>
    )}
  </>
);

export const DisplayDeviceControls = ({ settings, onChange }: DisplayDeviceControlsProps) => (
  <>
    <SelectControl
      label={__("Display", "kotlinskidev")}
      value={settings.display || ""}
      options={displayOptions}
      onChange={(value: string) => onChange("display", value)}
    />

    <FlexAndGridControls settings={settings} onChange={onChange} />

    <SelectControl
      label={__("Justify Self", "kotlinskidev")}
      value={settings.justifySelf || ""}
      options={justifySelfOptions}
      onChange={(value: string) => onChange("justifySelf", value)}
    />

    <SelectControl
      label={__("Align Self", "kotlinskidev")}
      value={settings.alignSelf || ""}
      options={alignSelfOptions}
      onChange={(value: string) => onChange("alignSelf", value)}
    />
  </>
);
