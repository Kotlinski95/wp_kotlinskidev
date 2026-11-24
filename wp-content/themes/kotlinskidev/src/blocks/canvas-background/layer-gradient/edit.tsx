import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

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

function gradientControls(): LayerControlSpec<CanvasLayerGradientAttributes>[] {
  return [
    { kind: "color", field: "colorStart", label: __("Start color", "kotlinskidev") },
    { kind: "color", field: "colorEnd", label: __("End color", "kotlinskidev") },
    {
      kind: "range",
      field: "angleDeg",
      label: __("Angle (deg)", "kotlinskidev"),
      fallback: 135,
      min: 0,
      max: 360,
    },
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 0.2,
      min: 0,
      max: 2,
      step: 0.05,
    },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { colorStart, colorEnd, angleDeg, speed } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Gradient Layer", "kotlinskidev")}
      layerType="gradient"
      layerParams={{ colorStart, colorEnd, angleDeg, speed }}
      controls={gradientControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
