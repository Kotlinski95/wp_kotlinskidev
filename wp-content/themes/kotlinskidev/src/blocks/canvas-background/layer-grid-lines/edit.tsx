import React from "react";
import { __ } from "@wordpress/i18n";
import CanvasLayerEdit, { type LayerControlSpec } from "../shared/CanvasLayerEdit";

export interface CanvasLayerGridLinesAttributes {
  opacity: number;
  lineCount: number;
  color: string;
}

interface EditProps {
  attributes: CanvasLayerGridLinesAttributes;
  setAttributes: (attrs: Partial<CanvasLayerGridLinesAttributes>) => void;
}

function gridLinesControls(): LayerControlSpec<CanvasLayerGridLinesAttributes>[] {
  return [
    {
      kind: "range",
      field: "opacity",
      label: __("Opacity", "kotlinskidev"),
      fallback: 0.08,
      min: 0,
      max: 0.4,
      step: 0.01,
    },
    {
      kind: "range",
      field: "lineCount",
      label: __("Line count", "kotlinskidev"),
      fallback: 12,
      min: 2,
      max: 40,
      step: 1,
    },
    { kind: "color", field: "color", label: __("Line color", "kotlinskidev") },
  ];
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { opacity, lineCount, color } = attributes;

  return (
    <CanvasLayerEdit
      title={__("Grid Lines Layer", "kotlinskidev")}
      layerType="grid-lines"
      layerParams={{ opacity, lineCount, color }}
      controls={gridLinesControls()}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );
}
