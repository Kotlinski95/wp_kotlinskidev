import React from "react";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerAuroraAttributes {
  speed: number;
  colorStart: string;
  colorEnd: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerAuroraAttributes;
  setAttributes: (attrs: Partial<CanvasLayerAuroraAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, colorStart, colorEnd, opacity } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Aurora Layer", "kotlinskidev")} initialOpen>
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
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>{__("Aurora Layer", "kotlinskidev")}</div>
    </>
  );
}
