import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerOrbitTrailsAttributes {
  speed: number;
  decay: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerOrbitTrailsAttributes;
  setAttributes: (attrs: Partial<CanvasLayerOrbitTrailsAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, decay, color, opacity } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Orbit Trails Layer", "kotlinskidev")} initialOpen>
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
            label={__("Trail length", "kotlinskidev")}
            value={decay}
            onChange={(value) => setAttributes({ decay: value ?? 0.986 })}
            min={0.9}
            max={0.999}
            step={0.001}
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
      <div {...blockProps}>{__("Orbit Trails Layer", "kotlinskidev")}</div>
    </>
  );
}
