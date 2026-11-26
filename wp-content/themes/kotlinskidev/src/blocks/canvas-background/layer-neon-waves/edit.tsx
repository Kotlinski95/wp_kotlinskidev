import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerNeonWavesAttributes {
  speed: number;
  intensity: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerNeonWavesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerNeonWavesAttributes>) => void;
}

function neonWavesControls(): LayerControlSpec<CanvasLayerNeonWavesAttributes>[] {
  return [
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 0.6,
      min: 0,
      max: 2,
      step: 0.05,
    },
    {
      kind: "range",
      field: "intensity",
      label: __("Intensity", "kotlinskidev"),
      fallback: 3,
      min: 1,
      max: 6,
      step: 0.25,
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
    { kind: "color", field: "color", label: __("Tint", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, intensity, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Neon Waves Layer", "kotlinskidev")}
      layerType="neon-waves"
      layerParams={{ speed, intensity, color, opacity }}
      controls={neonWavesControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
