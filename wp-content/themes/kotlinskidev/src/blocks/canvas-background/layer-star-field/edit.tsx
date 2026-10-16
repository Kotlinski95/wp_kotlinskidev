import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerStarFieldAttributes {
  layerCount: number;
  speed: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerStarFieldAttributes;
  setAttributes: (attrs: Partial<CanvasLayerStarFieldAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { layerCount, speed, color, opacity } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Star Field Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Depth layers", "kotlinskidev")}
            value={layerCount}
            onChange={(value) => setAttributes({ layerCount: value ?? 7 })}
            min={3}
            max={12}
            step={1}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 1 })}
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
      <div {...blockProps}>{__("Star Field Layer", "kotlinskidev")}</div>
    </>
  );
}
