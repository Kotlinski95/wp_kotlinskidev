import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerStarFieldAttributes {
  layerCount: number;
  speed: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerStarFieldAttributes;
  setAttributes: (attrs: Partial<CanvasLayerStarFieldAttributes>) => void;
}

function starFieldControls(): LayerControlSpec<CanvasLayerStarFieldAttributes>[] {
  return [
    {
      kind: "range",
      field: "layerCount",
      label: __("Depth layers", "kotlinskidev"),
      fallback: 7,
      min: 3,
      max: 12,
      step: 1,
    },
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
  const { layerCount, speed, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Star Field Layer", "kotlinskidev")}
      layerType="star-field"
      layerParams={{ layerCount, speed, color, opacity }}
      controls={starFieldControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
