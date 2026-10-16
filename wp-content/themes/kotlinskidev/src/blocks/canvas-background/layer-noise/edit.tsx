import React from "react";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerNoiseAttributes {
  opacity: number;
  jitterAmount: number;
  grainSize: number;
}

interface EditProps {
  attributes: CanvasLayerNoiseAttributes;
  setAttributes: (attrs: Partial<CanvasLayerNoiseAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { opacity, jitterAmount, grainSize } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Noise Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Opacity", "kotlinskidev")}
            value={opacity}
            onChange={(value) => setAttributes({ opacity: value ?? 0.06 })}
            min={0}
            max={0.3}
            step={0.01}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Jitter amount (px)", "kotlinskidev")}
            value={jitterAmount}
            onChange={(value) => setAttributes({ jitterAmount: value ?? 1.0 })}
            min={0}
            max={4}
            step={0.1}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Grain size", "kotlinskidev")}
            value={grainSize}
            onChange={(value) => setAttributes({ grainSize: value ?? 1 })}
            min={1}
            max={4}
            step={1}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>{__("Noise Layer", "kotlinskidev")}</div>
    </>
  );
}
