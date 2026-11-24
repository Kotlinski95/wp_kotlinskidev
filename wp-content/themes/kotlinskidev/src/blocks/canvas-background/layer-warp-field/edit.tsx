import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerWarpFieldAttributes {
  speed: number;
  density: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerWarpFieldAttributes;
  setAttributes: (attrs: Partial<CanvasLayerWarpFieldAttributes>) => void;
}

function warpFieldControls(): LayerControlSpec<CanvasLayerWarpFieldAttributes>[] {
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
      field: "density",
      label: __("Star density", "kotlinskidev"),
      fallback: 1,
      min: 0.3,
      max: 2.5,
      step: 0.1,
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
  const { speed, density, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Warp Field Layer", "kotlinskidev")}
      layerType="warp-field"
      layerParams={{ speed, density, color, opacity }}
      controls={warpFieldControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
