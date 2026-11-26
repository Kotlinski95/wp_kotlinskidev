import React from "react";
import { __experimentalColorGradientControl as ColorGradientControl } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { isGradientValue, type ContentTabsSettingsProps } from "./content-tabs-attributes";
import { useDualValueColorChange } from "./use-dual-value-color-change";

const ActiveTextColorControl = ({ attributes, setAttributes }: ContentTabsSettingsProps) => {
  const { activeTabColor } = attributes;
  const isGradient = isGradientValue(activeTabColor);
  const onChange = useDualValueColorChange((value) => setAttributes({ activeTabColor: value }));
  return (
    <ColorGradientControl
      label={__("Active tab text color", "kotlinskidev")}
      colorValue={activeTabColor && !isGradient ? activeTabColor : undefined}
      gradientValue={isGradient ? activeTabColor : undefined}
      onColorChange={onChange}
      onGradientChange={onChange}
      enableAlpha={true}
      clearable={true}
      __experimentalIsRenderedInSidebar={true}
      __nextHasNoMarginBottom
    />
  );
};

const ActiveBackgroundControl = ({ attributes, setAttributes }: ContentTabsSettingsProps) => {
  const { activeTabBackgroundColor } = attributes;
  const isGradient = isGradientValue(activeTabBackgroundColor);
  const onChange = useDualValueColorChange((value) =>
    setAttributes({ activeTabBackgroundColor: value })
  );
  return (
    <ColorGradientControl
      label={__("Active tab background color", "kotlinskidev")}
      colorValue={activeTabBackgroundColor && !isGradient ? activeTabBackgroundColor : undefined}
      gradientValue={isGradient ? activeTabBackgroundColor : undefined}
      onColorChange={onChange}
      onGradientChange={onChange}
      enableAlpha={true}
      clearable={true}
      __experimentalIsRenderedInSidebar={true}
      __nextHasNoMarginBottom
    />
  );
};

const ActiveBorderColorControl = ({ attributes, setAttributes }: ContentTabsSettingsProps) => (
  <ColorGradientControl
    label={__("Active tab border color", "kotlinskidev")}
    colorValue={attributes.activeTabBorderColor || undefined}
    onColorChange={(value: string | undefined) =>
      setAttributes({ activeTabBorderColor: value || "" })
    }
    enableAlpha={true}
    clearable={true}
    __experimentalIsRenderedInSidebar={true}
    __nextHasNoMarginBottom
  />
);

export const ActiveTabStylePanel = ({ attributes, setAttributes }: ContentTabsSettingsProps) => {
  const props = { attributes, setAttributes };
  return (
    <PanelBody title={__("Active Tab Style", "kotlinskidev")} initialOpen={false}>
      <p className="components-base-control__help">
        {__("Combine any of these to style the active tab.", "kotlinskidev")}
      </p>
      <ToggleControl
        label={__("Underline", "kotlinskidev")}
        checked={!!attributes.activeTabUnderline}
        onChange={(value) => setAttributes({ activeTabUnderline: value })}
      />
      <ToggleControl
        label={__("Text color", "kotlinskidev")}
        checked={!!attributes.activeTabTextColorEnabled}
        onChange={(value) => setAttributes({ activeTabTextColorEnabled: value })}
      />
      {attributes.activeTabTextColorEnabled && <ActiveTextColorControl {...props} />}
      <ToggleControl
        label={__("Background", "kotlinskidev")}
        checked={!!attributes.activeTabBackgroundEnabled}
        onChange={(value) => setAttributes({ activeTabBackgroundEnabled: value })}
      />
      {attributes.activeTabBackgroundEnabled && <ActiveBackgroundControl {...props} />}
      <ToggleControl
        label={__("Border color", "kotlinskidev")}
        checked={!!attributes.activeTabBorderColorEnabled}
        onChange={(value) => setAttributes({ activeTabBorderColorEnabled: value })}
      />
      {attributes.activeTabBorderColorEnabled && <ActiveBorderColorControl {...props} />}
    </PanelBody>
  );
};
