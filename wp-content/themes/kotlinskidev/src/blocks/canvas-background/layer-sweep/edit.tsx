import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

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

function sweepControls(): LayerControlSpec<CanvasLayerSweepAttributes>[] {
  return [
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 0.15,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      kind: "range",
      field: "angleDeg",
      label: __("Angle (deg)", "kotlinskidev"),
      fallback: 25,
      min: 0,
      max: 360,
      step: 1,
    },
    {
      kind: "range",
      field: "width",
      label: __("Width (fraction of diagonal)", "kotlinskidev"),
      fallback: 0.15,
      min: 0.02,
      max: 0.5,
      step: 0.01,
    },
    { kind: "color", field: "color", label: __("Color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, angleDeg, width, color } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Sweep Layer", "kotlinskidev")}
      layerType="sweep"
      layerParams={{ speed, angleDeg, width, color }}
      controls={sweepControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
