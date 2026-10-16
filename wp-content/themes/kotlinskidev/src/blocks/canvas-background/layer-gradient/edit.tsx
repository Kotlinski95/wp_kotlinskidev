import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerGradientAttributes {
  colorStart: string;
  colorEnd: string;
  angleDeg: number;
  speed: number;
}

interface EditProps {
  attributes: CanvasLayerGradientAttributes;
  setAttributes: (attrs: Partial<CanvasLayerGradientAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { colorStart, colorEnd, angleDeg, speed } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Gradient Layer", "kotlinskidev")} initialOpen>
          <ColorGradientControl
            label={__("Start color", "kotlinskidev")}
            colorValue={colorStart || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ colorStart: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable={false}
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("End color", "kotlinskidev")}
            colorValue={colorEnd || undefined}
            onColorChange={(value: string | undefined) => setAttributes({ colorEnd: value || "" })}
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable={false}
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Angle (deg)", "kotlinskidev")}
            value={angleDeg}
            onChange={(value) => setAttributes({ angleDeg: value ?? 135 })}
            min={0}
            max={360}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 0.2 })}
            min={0}
            max={2}
            step={0.05}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>{__("Gradient Layer", "kotlinskidev")}</div>
    </>
  );
}
