import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerHexTilesAttributes {
  speed: number;
  zoom: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerHexTilesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerHexTilesAttributes>) => void;
}

function hexTilesControls(): LayerControlSpec<CanvasLayerHexTilesAttributes>[] {
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
    { kind: "color", field: "color", label: __("Color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, zoom, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Hex Tiles Layer", "kotlinskidev")}
      layerType="hex-tiles"
      layerParams={{ speed, zoom, color, opacity }}
      controls={hexTilesControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
