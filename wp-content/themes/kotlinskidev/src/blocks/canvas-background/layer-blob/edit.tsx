import React from "react";
import CanvasRecipePreview from "../shared/CanvasRecipePreview";
import {
  useBlockProps,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface CanvasLayerBlobAttributes {
  count: number;
  speed: number;
  color: string;
  radiusPct: number;
}

interface EditProps {
  attributes: CanvasLayerBlobAttributes;
  setAttributes: (attrs: Partial<CanvasLayerBlobAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { count, speed, color, radiusPct } = attributes;
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Blob Layer", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Blob count", "kotlinskidev")}
            value={count}
            onChange={(value) => setAttributes({ count: value ?? 3 })}
            min={1}
            max={8}
            step={1}
            __nextHasNoMarginBottom
          />
          <RangeControl
            label={__("Speed", "kotlinskidev")}
            value={speed}
            onChange={(value) => setAttributes({ speed: value ?? 0.3 })}
            min={0}
            max={1.5}
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
          <RangeControl
            label={__("Radius (% of canvas)", "kotlinskidev")}
            value={radiusPct}
            onChange={(value) => setAttributes({ radiusPct: value ?? 25 })}
            min={5}
            max={60}
            step={1}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <div
        {...blockProps}
        style={{ ...blockProps.style, position: "relative", overflow: "hidden" }}
      >
        <CanvasRecipePreview
          recipe={{ layers: [{ type: "blob", params: { count, speed, color, radiusPct } }] }}
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
          {__("Blob Layer", "kotlinskidev")}
        </span>
      </div>
    </>
  );
}
