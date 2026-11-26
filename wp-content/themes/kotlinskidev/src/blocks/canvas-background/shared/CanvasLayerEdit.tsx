import React from "react";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import CanvasRecipePreview from "./CanvasRecipePreview";
import { SolidColorControl } from "../../shared/solid-color-control";

export interface RangeControlSpec<Attributes> {
  kind: "range";
  field: keyof Attributes & string;
  label: string;
  fallback: number;
  min: number;
  max: number;
  step?: number;
}

export interface ColorControlSpec<Attributes> {
  kind: "color";
  field: keyof Attributes & string;
  label: string;
}

export type LayerControlSpec<Attributes> =
  | RangeControlSpec<Attributes>
  | ColorControlSpec<Attributes>;

interface CanvasLayerEditProps<Attributes> {
  title: string;
  layerType: string;
  layerParams: Record<string, unknown>;
  controls: LayerControlSpec<Attributes>[];
  setAttributes: (attributes: Partial<Attributes>) => void;
  attributes: Attributes;
}

const PREVIEW_HEIGHT = 140;

const BADGE_STYLE: React.CSSProperties = {
  position: "absolute",
  insetInlineStart: 0,
  insetBlockEnd: 0,
  padding: "2px 6px",
  fontSize: "11px",
  lineHeight: 1.4,
  color: "#fff",
  background: "rgba(0, 0, 0, 0.55)",
  pointerEvents: "none",
};

function LayerControl<Attributes>({
  spec,
  attributes,
  setAttributes,
}: {
  spec: LayerControlSpec<Attributes>;
  attributes: Attributes;
  setAttributes: (attributes: Partial<Attributes>) => void;
}) {
  const current = attributes[spec.field] as unknown;
  const update = (value: unknown) =>
    setAttributes({ [spec.field]: value } as unknown as Partial<Attributes>);

  if (spec.kind === "range") {
    return (
      <RangeControl
        label={spec.label}
        value={current as number}
        onChange={(value) => update(value ?? spec.fallback)}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        __nextHasNoMarginBottom
      />
    );
  }

  return (
    <SolidColorControl
      label={spec.label}
      value={current as string}
      onChange={update}
      clearable={false}
    />
  );
}

export default function CanvasLayerEdit<Attributes>({
  title,
  layerType,
  layerParams,
  controls,
  attributes,
  setAttributes,
}: CanvasLayerEditProps<Attributes>) {
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={title} initialOpen>
          {controls.map((spec) => (
            <LayerControl
              key={spec.field}
              spec={spec}
              attributes={attributes}
              setAttributes={setAttributes}
            />
          ))}
        </PanelBody>
      </InspectorControls>
      <div
        {...blockProps}
        style={{ ...blockProps.style, position: "relative", overflow: "hidden" }}
      >
        <CanvasRecipePreview
          recipe={{ layers: [{ type: layerType, params: layerParams }] }}
          height={PREVIEW_HEIGHT}
        />
        <span style={BADGE_STYLE}>{title}</span>
      </div>
    </>
  );
}
