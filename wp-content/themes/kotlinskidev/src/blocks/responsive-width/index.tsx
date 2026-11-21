import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import type { BlockEditProps, BlockSettings } from "@utils/block-filter-types";
import { AdvancedDevicePanel, DeviceSettingsCard } from "@utils/responsive-device-panel";
import { RESPONSIVE_DEVICES } from "@utils/responsive-breakpoints";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { WidthValueControl } from "./width-value-control";

interface ResponsiveWidthDeviceSettings {
  width?: string;
  maxWidth?: string;
}

type ResponsiveWidthAttribute = Record<ResponsiveDevice, ResponsiveWidthDeviceSettings>;

interface ResponsiveWidthAttributes {
  responsiveWidth?: ResponsiveWidthAttribute;
}

const DEFAULT_RESPONSIVE_WIDTH: ResponsiveWidthAttribute = {
  desktop: {},
  tablet: {},
  mobile: {},
};

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

const hasAnyResponsiveWidthValue = (responsiveWidth: ResponsiveWidthAttribute): boolean => {
  return RESPONSIVE_DEVICES.some((device) => {
    const settings = responsiveWidth[device] || {};
    return Boolean(settings.width) || Boolean(settings.maxWidth);
  });
};

interface WidthPanelProps {
  responsiveWidth: ResponsiveWidthAttribute;
  setAttributes: BlockEditProps<ResponsiveWidthAttributes>["setAttributes"];
}

const WidthDeviceFields = ({
  settings,
  onChange,
}: {
  settings: ResponsiveWidthDeviceSettings;
  onChange: (property: keyof ResponsiveWidthDeviceSettings, value: string) => void;
}) => (
  <>
    <WidthValueControl
      label={__("Width", "kotlinskidev")}
      presetLabel={__("Width preset", "kotlinskidev")}
      value={settings.width || ""}
      onChange={(value) => onChange("width", value)}
    />

    <WidthValueControl
      label={__("Max Width", "kotlinskidev")}
      presetLabel={__("Max width preset", "kotlinskidev")}
      value={settings.maxWidth || ""}
      onChange={(value) => onChange("maxWidth", value)}
    />
  </>
);

const WidthPanel = ({ responsiveWidth, setAttributes }: WidthPanelProps) => {
  const [isAdvancedOpen, setAdvancedOpen] = useState(hasAnyResponsiveWidthValue(responsiveWidth));

  const updateResponsiveWidth = (
    device: ResponsiveDevice,
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

  const renderDeviceControls = (device: ResponsiveDevice, label: string, helpText: string) => (
    <DeviceSettingsCard key={device} label={label} helpText={helpText}>
      <WidthDeviceFields
        settings={responsiveWidth[device] || {}}
        onChange={(property, value) => updateResponsiveWidth(device, property, value)}
      />
    </DeviceSettingsCard>
  );

  return (
    <AdvancedDevicePanel
      panelTitle={__("Responsive Width", "kotlinskidev")}
      toggleLabel={__("Advanced Width Settings", "kotlinskidev")}
      toggleHelp={__("Configure width and max-width per breakpoint", "kotlinskidev")}
      isAdvancedOpen={isAdvancedOpen}
      onToggleAdvanced={setAdvancedOpen}
      renderDeviceControls={renderDeviceControls}
    />
  );
};

const withResponsiveWidthControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ResponsiveWidthAttributes>) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const responsiveWidth = props.attributes.responsiveWidth || DEFAULT_RESPONSIVE_WIDTH;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <WidthPanel responsiveWidth={responsiveWidth} setAttributes={props.setAttributes} />
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

  RESPONSIVE_DEVICES.forEach((device) => {
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
  attributes?: ResponsiveWidthAttributes;
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
