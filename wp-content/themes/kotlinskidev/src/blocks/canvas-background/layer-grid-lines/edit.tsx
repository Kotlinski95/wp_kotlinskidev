import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerGridLinesAttributes {
  opacity: number;
  lineCount: number;
  color: string;
}

interface EditProps {
  attributes: CanvasLayerGridLinesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerGridLinesAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { opacity, lineCount, color } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Grid Lines Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Opacity", "kotlinskidev")}
            value={opacity}
            onChange={(value) => setAttributes({ opacity: value ?? 0.08 })}
            min={0}
            max={0.4}
            step={0.01}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Line count", "kotlinskidev")}
            value={lineCount}
            onChange={(value) => setAttributes({ lineCount: value ?? 12 })}
            min={2}
            max={40}
            step={1}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Line color", "kotlinskidev")}
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
      <div {...blockProps}>{__("Grid Lines Layer", "kotlinskidev")}</div>
    </>
  );
}
