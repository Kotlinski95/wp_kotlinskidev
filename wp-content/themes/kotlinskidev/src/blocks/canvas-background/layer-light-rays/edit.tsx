import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerLightRaysAttributes {
  rayCount: number;
  speed: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerLightRaysAttributes;
  setAttributes: (attrs: Partial<CanvasLayerLightRaysAttributes>) => void;
}

function lightRaysControls(): LayerControlSpec<CanvasLayerLightRaysAttributes>[] {
  return [
    {
      kind: "range",
      field: "rayCount",
      label: __("Ray count", "kotlinskidev"),
      fallback: 8,
      min: 1,
      max: 24,
      step: 1,
    },
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 0.3,
      min: 0,
      max: 2,
      step: 0.05,
    },
    {
      kind: "range",
      field: "opacity",
      label: __("Opacity", "kotlinskidev"),
      fallback: 0.5,
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
      title={__("Light Rays Layer", "kotlinskidev")}
      layerType="light-rays"
      layerParams={{ rayCount, speed, color, opacity }}
      controls={lightRaysControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
