import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerNoiseAttributes {
  opacity: number;
  jitterAmount: number;
  grainSize: number;
}

interface EditProps {
  attributes: CanvasLayerNoiseAttributes;
  setAttributes: (attrs: Partial<CanvasLayerNoiseAttributes>) => void;
}

function noiseControls(): LayerControlSpec<CanvasLayerNoiseAttributes>[] {
  return [
    {
      kind: "range",
      field: "opacity",
      label: __("Opacity", "kotlinskidev"),
      fallback: 0.06,
      min: 0,
      max: 0.3,
      step: 0.01,
    },
    {
      kind: "range",
      field: "jitterAmount",
      label: __("Jitter amount (px)", "kotlinskidev"),
      fallback: 1.0,
      min: 0,
      max: 4,
      step: 0.1,
    },
    {
      kind: "range",
      field: "grainSize",
      label: __("Grain size", "kotlinskidev"),
      fallback: 1,
      min: 1,
      max: 4,
      step: 1,
    },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { opacity, jitterAmount, grainSize } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Noise Layer", "kotlinskidev")}
      layerType="noise"
      layerParams={{ opacity, jitterAmount, grainSize }}
      controls={noiseControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
