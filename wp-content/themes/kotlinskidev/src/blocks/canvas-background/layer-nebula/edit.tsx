import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerNebulaAttributes {
  speed: number;
  zoom: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerNebulaAttributes;
  setAttributes: (attrs: Partial<CanvasLayerNebulaAttributes>) => void;
}

function nebulaControls(): LayerControlSpec<CanvasLayerNebulaAttributes>[] {
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
      field: "zoom",
      label: __("Zoom", "kotlinskidev"),
      fallback: 1,
      min: 0.5,
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
    { kind: "color", field: "color", label: __("Tint", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, zoom, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Nebula Layer", "kotlinskidev")}
      layerType="nebula"
      layerParams={{ speed, zoom, color, opacity }}
      controls={nebulaControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
