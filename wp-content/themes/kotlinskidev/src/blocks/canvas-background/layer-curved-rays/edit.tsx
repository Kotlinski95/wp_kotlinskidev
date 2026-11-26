import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerCurvedRaysAttributes {
  rayCount: number;
  speed: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerCurvedRaysAttributes;
  setAttributes: (attrs: Partial<CanvasLayerCurvedRaysAttributes>) => void;
}

function curvedRaysControls(): LayerControlSpec<CanvasLayerCurvedRaysAttributes>[] {
  return [
    {
      kind: "range",
      field: "rayCount",
      label: __("Ray count", "kotlinskidev"),
      fallback: 16,
      min: 4,
      max: 32,
      step: 1,
    },
    {
      kind: "range",
      field: "speed",
      label: __("Pulse speed", "kotlinskidev"),
      fallback: 0.4,
      min: 0,
      max: 2,
      step: 0.05,
    },
    {
      kind: "range",
      field: "opacity",
      label: __("Opacity", "kotlinskidev"),
      fallback: 1,
      min: 0,
      max: 1,
      step: 0.05,
    },
    { kind: "color", field: "color", label: __("Color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { rayCount, speed, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Curved Rays Layer", "kotlinskidev")}
      layerType="curved-rays"
      layerParams={{ rayCount, speed, color, opacity }}
      controls={curvedRaysControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
