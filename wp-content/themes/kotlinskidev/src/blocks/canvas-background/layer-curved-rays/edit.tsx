import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerCurvedRaysAttributes {
  rayCount: number;
  speed: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerCurvedRaysAttributes;
  setAttributes: (attrs: Partial<CanvasLayerCurvedRaysAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { rayCount, speed, color, opacity } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Curved Rays Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Ray count", "kotlinskidev")}
            value={rayCount}
            onChange={(value) => setAttributes({ rayCount: value ?? 16 })}
            min={4}
            max={32}
            step={1}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Pulse speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 0.4 })}
            min={0}
            max={2}
            step={0.05}
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
            label={__("Color", "kotlinskidev")}
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
      <div {...blockProps}>{__("Curved Rays Layer", "kotlinskidev")}</div>
    </>
  );
}
