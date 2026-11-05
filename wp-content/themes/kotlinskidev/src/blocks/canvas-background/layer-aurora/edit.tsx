import React from "react";
import CanvasRecipePreview from "../shared/CanvasRecipePreview";
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
      <div
        {...blockProps}
        style={{ ...blockProps.style, position: "relative", overflow: "hidden" }}
      >
        <CanvasRecipePreview
          recipe={{
            layers: [{ type: "aurora", params: { speed, colorStart, colorEnd, opacity } }],
          }}
          height={140}
        />
        <span
          style={{
            position: "absolute",
            insetInlineStart: 0,
            insetBlockEnd: 0,
            padding: "2px 6px",
            fontSize: "11px",
            lineHeight: 1.4,
            color: "#fff",
            background: "rgba(0, 0, 0, 0.55)",
            pointerEvents: "none",
          }}
        >
          {__("Aurora Layer", "kotlinskidev")}
        </span>
      </div>
    </>
  );
}
