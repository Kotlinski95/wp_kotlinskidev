import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface BgEffectPresetSettingsAttributes {
  effectType: string;
  color1: string;
  color2: string;
  color3: string;
  duration: number;
}

interface EditProps {
  attributes: BgEffectPresetSettingsAttributes;
  setAttributes: (attrs: Partial<BgEffectPresetSettingsAttributes>) => void;
}

const effectTypes = [
  { label: __("Gradient Shift", "kotlinskidev"), value: "gradient-shift" },
  { label: __("Aurora", "kotlinskidev"), value: "aurora" },
  { label: __("Wave", "kotlinskidev"), value: "wave" },
  { label: __("Shimmer Text", "kotlinskidev"), value: "shimmer-text" },
  { label: __("Glow Border", "kotlinskidev"), value: "glow-border" },
];

const defaultDurationFor = (effectType: string): number => {
  switch (effectType) {
    case "aurora":
      return 12;
    case "wave":
      return 8;
    case "shimmer-text":
    case "glow-border":
      return 6;
    default:
      return 15;
  }
};

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { effectType, color1, color2, color3, duration } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Preset Settings", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Effect", "kotlinskidev")}
            value={effectType}
            options={effectTypes}
            onChange={(value) =>
              setAttributes({ effectType: value, duration: defaultDurationFor(value) })
            }
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Duration (seconds)", "kotlinskidev")}
            value={duration}
            onChange={(value) =>
              setAttributes({ duration: value ?? defaultDurationFor(effectType) })
            }
            min={1}
            max={30}
            step={0.5}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Color 1", "kotlinskidev")}
            colorValue={color1 || undefined}
            onColorChange={(value: string | undefined) => setAttributes({ color1: value || "" })}
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Color 2", "kotlinskidev")}
            colorValue={color2 || undefined}
            onColorChange={(value: string | undefined) => setAttributes({ color2: value || "" })}
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Color 3", "kotlinskidev")}
            colorValue={color3 || undefined}
            onColorChange={(value: string | undefined) => setAttributes({ color3: value || "" })}
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <p className="components-base-control__help">
            {__("Leave a color empty to keep the theme's default.", "kotlinskidev")}
          </p>
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>{__("Background Effect Preset Settings", "kotlinskidev")}</div>
    </>
  );
}
