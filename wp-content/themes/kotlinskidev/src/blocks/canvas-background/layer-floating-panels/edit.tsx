import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerFloatingPanelsAttributes {
  speed: number;
  colorStart: string;
  colorEnd: string;
  opacity: number;
}

interface EditProps {
  attributes: CanvasLayerFloatingPanelsAttributes;
  setAttributes: (attrs: Partial<CanvasLayerFloatingPanelsAttributes>) => void;
}

function floatingPanelsControls(): LayerControlSpec<CanvasLayerFloatingPanelsAttributes>[] {
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
    { kind: "color", field: "colorStart", label: __("Background color", "kotlinskidev") },
    { kind: "color", field: "colorEnd", label: __("Panel color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { speed, colorStart, colorEnd, opacity } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Floating Panels Layer", "kotlinskidev")}
      layerType="floating-panels"
      layerParams={{ speed, colorStart, colorEnd, opacity }}
      controls={floatingPanelsControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
