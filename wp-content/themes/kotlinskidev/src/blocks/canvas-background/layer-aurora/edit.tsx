import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerAuroraAttributes {
  speed: number;
  colorStart: string;
  colorEnd: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerAuroraAttributes;
  setAttributes: (attrs: Partial<CanvasLayerAuroraAttributes>) => void;
}

function auroraControls(): LayerControlSpec<CanvasLayerAuroraAttributes>[] {
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
      field: "opacity",
      label: __("Opacity", "kotlinskidev"),
      fallback: 1,
      min: 0,
      max: 1,
      step: 0.05,
    },
    { kind: "color", field: "colorStart", label: __("Start color", "kotlinskidev") },
    { kind: "color", field: "colorEnd", label: __("End color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, colorStart, colorEnd, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Aurora Layer", "kotlinskidev")}
      layerType="aurora"
      layerParams={{ speed, colorStart, colorEnd, opacity }}
      controls={auroraControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
