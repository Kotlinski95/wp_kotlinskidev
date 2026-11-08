import React from "react";
import CanvasRecipePreview from "../shared/CanvasRecipePreview";
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
      <div
        {...blockProps}
        style={{ ...blockProps.style, position: "relative", overflow: "hidden" }}
      >
        <CanvasRecipePreview
          recipe={{ layers: [{ type: "sweep", params: { speed, angleDeg, width, color } }] }}
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
          {__("Sweep Layer", "kotlinskidev")}
        </span>
      </div>
    </>
  );
}
