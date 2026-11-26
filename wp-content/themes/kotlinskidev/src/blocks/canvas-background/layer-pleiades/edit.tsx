import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerPleiadesAttributes {
  speed: number;
  intensity: number;
  color: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerPleiadesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerPleiadesAttributes>) => void;
}

function pleiadesControls(): LayerControlSpec<CanvasLayerPleiadesAttributes>[] {
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
      field: "intensity",
      label: __("Exposure", "kotlinskidev"),
      fallback: 2.2,
      min: 1,
      max: 4,
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
    { kind: "color", field: "color", label: __("Tint", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, intensity, color, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Pleiades Layer", "kotlinskidev")}
      layerType="pleiades"
      layerParams={{ speed, intensity, color, opacity }}
      controls={pleiadesControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
