import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerNeonWavesAttributes {
  speed: number;
  intensity: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerNeonWavesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerNeonWavesAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, intensity, color, opacity } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Neon Waves Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 0.6 })}
            min={0}
            max={2}
            step={0.05}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Intensity", "kotlinskidev")}
            value={intensity}
            onChange={(value) => setAttributes({ intensity: value ?? 3 })}
            min={1}
            max={6}
            step={0.25}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Opacity", "kotlinskidev")}
            value={opacity}
            onChange={(value) => setAttributes({ opacity: value ?? 1 })}
            min={0}
            max={1}
            step={0.05}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Tint", "kotlinskidev")}
            colorValue={color || undefined}
            onColorChange={(value: string | undefined) => setAttributes({ color: value || "" })}
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable={false}
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>{__("Neon Waves Layer", "kotlinskidev")}</div>
    </>
  );
}
