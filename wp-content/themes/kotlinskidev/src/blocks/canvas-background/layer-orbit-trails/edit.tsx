import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerOrbitTrailsAttributes {
  speed: number;
  decay: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerOrbitTrailsAttributes;
  setAttributes: (attrs: Partial<CanvasLayerOrbitTrailsAttributes>) => void;
}

function orbitTrailsControls(): LayerControlSpec<CanvasLayerOrbitTrailsAttributes>[] {
  return [
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 1,
      min: 0,
      max: 2,
      step: 0.05,
    },
    {
      kind: "range",
      field: "decay",
      label: __("Trail length", "kotlinskidev"),
      fallback: 0.986,
      min: 0.9,
      max: 0.999,
      step: 0.001,
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
  const { speed, decay, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Orbit Trails Layer", "kotlinskidev")}
      layerType="orbit-trails"
      layerParams={{ speed, decay, color, opacity }}
      controls={orbitTrailsControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
