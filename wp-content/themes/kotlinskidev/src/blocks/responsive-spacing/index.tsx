import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import type { BlockSettings } from "@utils/block-filter-types";
import { AdvancedDevicePanel, DeviceSettingsCard } from "@utils/responsive-device-panel";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { SpacingGroupControl } from "./spacing-group-control";
import {
  DEFAULT_SIDE_VALUES,
  EMPTY_SPACING_VALUE,
  buildResponsiveSpacingPreviewStyle,
  buildSpacingAttributeDefaults,
  hasAnyResponsiveSpacingValue,
} from "./spacing-attribute";
import type {
  ResponsiveSpacingAttributes,
  SpacingSide,
  SpacingSideValues,
  SpacingType,
} from "./spacing-attribute";

const addResponsiveSpacingAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      ...buildSpacingAttributeDefaults(),
    },
  };
};

interface BlockEditProps {
  attributes: Record<string, unknown> & Partial<ResponsiveSpacingAttributes>;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

interface SpacingSideChange {
  device: ResponsiveDevice;
  type: SpacingType;
  side: SpacingSide;
  value: string;
}

const SpacingPanel = ({ attributes, setAttributes }: BlockEditProps) => {
  const [isAdvancedOpen, setAdvancedOpen] = useState(hasAnyResponsiveSpacingValue(attributes));

  const updateSpacingSide = ({ device, type, side, value }: SpacingSideChange) => {
    const attributeKey = `${device}${type}` as const;
    const current = (attributes[attributeKey] as SpacingSideValues) || DEFAULT_SIDE_VALUES;
    setAttributes({
      [attributeKey]: {
        ...current,
        [side]: value || EMPTY_SPACING_VALUE,
      },
    });
  };

  const renderSpacingGroup = (device: ResponsiveDevice, type: SpacingType) => {
    const attributeKey = `${device}${type}` as const;
    const values = (attributes[attributeKey] as SpacingSideValues) || DEFAULT_SIDE_VALUES;

    return (
      <SpacingGroupControl
        type={type}
        values={values}
        onChangeSide={(side, value) => updateSpacingSide({ device, type, side, value })}
      />
    );
  };

  const renderDeviceControls = (device: ResponsiveDevice, label: string, helpText: string) => (
    <DeviceSettingsCard key={device} label={label} helpText={helpText}>
      {renderSpacingGroup(device, "Padding")}
      {renderSpacingGroup(device, "Margin")}
    </DeviceSettingsCard>
  );

  return (
    <AdvancedDevicePanel
      panelTitle={__("Responsive Spacing", "kotlinskidev")}
      toggleLabel={__("Advanced Spacing Settings", "kotlinskidev")}
      toggleHelp={__("Configure padding and margin per breakpoint", "kotlinskidev")}
      isAdvancedOpen={isAdvancedOpen}
      onToggleAdvanced={setAdvancedOpen}
      renderDeviceControls={renderDeviceControls}
    />
  );
};

const withResponsiveSpacingControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => (
    <Fragment>
      <BlockEdit {...props} />
      <SpacingPanel attributes={props.attributes} setAttributes={props.setAttributes} />
    </Fragment>
  );
}, "withResponsiveSpacingControls");

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
