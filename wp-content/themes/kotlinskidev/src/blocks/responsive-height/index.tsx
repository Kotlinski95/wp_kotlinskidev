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
import { HeightValueControl } from "./height-value-control";

interface ResponsiveHeightDeviceSettings {
  minHeight?: string;
}

type ResponsiveHeightAttribute = Record<ResponsiveDevice, ResponsiveHeightDeviceSettings>;

interface ResponsiveHeightAttributes {
  responsiveHeight?: ResponsiveHeightAttribute;
}

const DEFAULT_RESPONSIVE_HEIGHT: ResponsiveHeightAttribute = {
  desktop: {},
  tablet: {},
  mobile: {},
};

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

const hasAnyResponsiveHeightValue = (responsiveHeight: ResponsiveHeightAttribute): boolean => {
  return RESPONSIVE_DEVICES.some((device) => {
    const settings = responsiveHeight[device] || {};
    return Boolean(settings.minHeight);
  });
};

interface HeightPanelProps {
  responsiveHeight: ResponsiveHeightAttribute;
  setAttributes: BlockEditProps<ResponsiveHeightAttributes>["setAttributes"];
}

const HeightPanel = ({ responsiveHeight, setAttributes }: HeightPanelProps) => {
  const [isAdvancedOpen, setAdvancedOpen] = useState(hasAnyResponsiveHeightValue(responsiveHeight));

  const updateResponsiveHeight = (device: ResponsiveDevice, value: string) => {
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

  const renderDeviceControls = (device: ResponsiveDevice, label: string, helpText: string) => {
    const deviceSettings = responsiveHeight[device] || {};

    return (
      <DeviceSettingsCard key={device} label={label} helpText={helpText}>
        <HeightValueControl
          label={__("Min Height", "kotlinskidev")}
          presetLabel={__("Min height preset", "kotlinskidev")}
          value={deviceSettings.minHeight || ""}
          onChange={(value) => updateResponsiveHeight(device, value)}
        />
      </DeviceSettingsCard>
    );
  };

  return (
    <AdvancedDevicePanel
      panelTitle={__("Responsive Min Height", "kotlinskidev")}
      toggleLabel={__("Advanced Min Height Settings", "kotlinskidev")}
      toggleHelp={__("Configure min-height per breakpoint", "kotlinskidev")}
      isAdvancedOpen={isAdvancedOpen}
      onToggleAdvanced={setAdvancedOpen}
      renderDeviceControls={renderDeviceControls}
    />
  );
};

const withResponsiveHeightControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ResponsiveHeightAttributes>) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const responsiveHeight = props.attributes.responsiveHeight || DEFAULT_RESPONSIVE_HEIGHT;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <HeightPanel responsiveHeight={responsiveHeight} setAttributes={props.setAttributes} />
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

  RESPONSIVE_DEVICES.forEach((device) => {
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
  RESPONSIVE_DEVICES.forEach((device) => {
    const settings = responsiveHeight[device] || {};
    inherited = settings.minHeight || inherited;

    if (inherited) {
      classes.push(`kt-has-responsive-height-${device}`);
    }
  });

  return classes;
};

interface BlockListBlockProps {
  attributes?: ResponsiveHeightAttributes;
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
