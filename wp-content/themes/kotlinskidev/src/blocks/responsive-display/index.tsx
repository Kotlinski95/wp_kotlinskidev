import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import { appendClassName } from "@utils/block-filter-types";
import type { BlockEditProps, BlockSettings, ExtraProps } from "@utils/block-filter-types";
import { AdvancedDevicePanel, DeviceSettingsCard } from "@utils/responsive-device-panel";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { DisplayDeviceControls } from "./device-controls";
import {
  buildDisplayClassString,
  emptyResponsiveDisplay,
  hasAnyDisplaySetting,
} from "./display-attribute";
import type {
  DisplayProperty,
  ResponsiveDisplayAttribute,
  ResponsiveDisplayAttributes,
} from "./display-attribute";

const addResponsiveDisplayAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name as string)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveDisplay: {
        type: "object",
        default: emptyResponsiveDisplay(),
      },
    },
  };
};

interface DisplayPanelProps {
  responsiveDisplay: ResponsiveDisplayAttribute;
  setAttributes: BlockEditProps<ResponsiveDisplayAttributes>["setAttributes"];
}

const DisplayPanel = ({ responsiveDisplay, setAttributes }: DisplayPanelProps) => {
  const [isAdvancedOpen, setAdvancedOpen] = useState(hasAnyDisplaySetting(responsiveDisplay));

  const updateResponsiveDisplay = (
    device: ResponsiveDevice,
    property: DisplayProperty,
    value: string
  ) => {
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

  const renderDeviceControls = (device: ResponsiveDevice, label: string, helpText: string) => (
    <DeviceSettingsCard label={label} helpText={helpText}>
      <DisplayDeviceControls
        settings={responsiveDisplay[device] || {}}
        onChange={(property, value) => updateResponsiveDisplay(device, property, value)}
      />
    </DeviceSettingsCard>
  );

  return (
    <AdvancedDevicePanel
      panelTitle={__("Display & Layout", "kotlinskidev")}
      toggleLabel={__("Advanced Display Settings", "kotlinskidev")}
      toggleHelp={__("Configure responsive display, flex, and grid properties", "kotlinskidev")}
      isAdvancedOpen={isAdvancedOpen}
      onToggleAdvanced={setAdvancedOpen}
      renderDeviceControls={renderDeviceControls}
    />
  );
};

const withResponsiveDisplayControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ResponsiveDisplayAttributes>) => {
    const { attributes, setAttributes, name } = props;
    const { responsiveDisplay = emptyResponsiveDisplay() } = attributes;

    if (DYNAMIC_PREVIEW_BLOCKS.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <DisplayPanel responsiveDisplay={responsiveDisplay} setAttributes={setAttributes} />
      </Fragment>
    );
  };
}, "withResponsiveDisplayControls");

interface BlockListBlockProps {
  attributes: ResponsiveDisplayAttributes;
  className?: string;
}

const addResponsiveDisplayClasses = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const additionalClasses = buildDisplayClassString(props.attributes.responsiveDisplay);

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} ${additionalClasses}`.trim()}
      />
    );
  };
}, "addResponsiveDisplayClasses");

const applyResponsiveDisplayClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: ResponsiveDisplayAttributes
): ExtraProps => {
  const additionalClasses = buildDisplayClassString(attributes.responsiveDisplay).trim();

  if (additionalClasses) {
    appendClassName(extraProps, additionalClasses);
  }

  return extraProps;
};

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
