import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerBlobAttributes {
  count: number;
  speed: number;
  color: string;
  radiusPct: number;
}

interface EditProps {
  attributes: CanvasLayerBlobAttributes;
  setAttributes: (attrs: Partial<CanvasLayerBlobAttributes>) => void;
}

function blobControls(): LayerControlSpec<CanvasLayerBlobAttributes>[] {
  return [
    {
      kind: "range",
      field: "count",
      label: __("Blob count", "kotlinskidev"),
      fallback: 3,
      min: 1,
      max: 8,
      step: 1,
    },
    {
      kind: "range",
      field: "speed",
      label: __("Speed", "kotlinskidev"),
      fallback: 0.3,
      min: 0,
      max: 1.5,
      step: 0.05,
    },
    { kind: "color", field: "color", label: __("Color", "kotlinskidev") },
    {
      kind: "range",
      field: "radiusPct",
      label: __("Radius (% of canvas)", "kotlinskidev"),
      fallback: 25,
      min: 5,
      max: 60,
      step: 1,
    },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { count, speed, color, radiusPct } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Blob Layer", "kotlinskidev")}
      layerType="blob"
      layerParams={{ count, speed, color, radiusPct }}
      controls={blobControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
