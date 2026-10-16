import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerSweepAttributes {
  speed: number;
  angleDeg: number;
  width: number;
  color: string;
}

interface EditProps {
  attributes: CanvasLayerSweepAttributes;
  setAttributes: (attrs: Partial<CanvasLayerSweepAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, angleDeg, width, color } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Sweep Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 0.15 })}
            min={0}
            max={1}
            step={0.05}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Angle (deg)", "kotlinskidev")}
            value={angleDeg}
            onChange={(value) => setAttributes({ angleDeg: value ?? 25 })}
            min={0}
            max={360}
            step={1}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Width (fraction of diagonal)", "kotlinskidev")}
            value={width}
            onChange={(value) => setAttributes({ width: value ?? 0.15 })}
            min={0.02}
            max={0.5}
            step={0.01}
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
      <div {...blockProps}>{__("Sweep Layer", "kotlinskidev")}</div>
    </>
  );
}
