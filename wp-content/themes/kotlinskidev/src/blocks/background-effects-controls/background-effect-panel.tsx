import React from "react";
import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, ComboboxControl } from "@wordpress/components";
import type { BackgroundEffectAttributes } from "./background-effect-attributes";

const GLOW_BORDER_EFFECT = "kt-bg-fx-glow-border";

const backgroundEffects = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Gradient Shift", "kotlinskidev"), value: "kt-bg-fx-gradient-shift" },
  { label: __("Aurora", "kotlinskidev"), value: "kt-bg-fx-aurora" },
  { label: __("Shimmer Text", "kotlinskidev"), value: "kt-bg-fx-shimmer-text" },
  { label: __("Wave", "kotlinskidev"), value: "kt-bg-fx-wave" },
  { label: __("Glow Border", "kotlinskidev"), value: GLOW_BORDER_EFFECT },
];

export interface PresetOption {
  value: string;
  label: string;
}

type ColorAttribute =
  | "backgroundEffectColor1"
  | "backgroundEffectColor2"
  | "backgroundEffectColor3";

interface BackgroundEffectPanelProps {
  attributes: BackgroundEffectAttributes;
  setAttributes: (attributes: Partial<BackgroundEffectAttributes>) => void;
  presetOptions: PresetOption[];
}

interface EffectColorControlProps {
  label: string;
  attribute: ColorAttribute;
  attributes: BackgroundEffectAttributes;
  setAttributes: (attributes: Partial<BackgroundEffectAttributes>) => void;
}

const EffectColorControl = ({
  label,
  attribute,
  attributes,
  setAttributes,
}: EffectColorControlProps) => (
  <ColorGradientControl
    label={label}
    colorValue={attributes[attribute] || undefined}
    onColorChange={(value: string | undefined) => setAttributes({ [attribute]: value || "" })}
    enableAlpha={true}
    clearable={true}
    __experimentalIsRenderedInSidebar={true}
    __nextHasNoMarginBottom
  />
);

const EffectColorsSection = ({
  attributes,
  setAttributes,
}: Pick<BackgroundEffectPanelProps, "attributes" | "setAttributes">) => (
  <>
    <EffectColorControl
      label={__("Effect color 1", "kotlinskidev")}
      attribute="backgroundEffectColor1"
      attributes={attributes}
      setAttributes={setAttributes}
    />
    <EffectColorControl
      label={__("Effect color 2", "kotlinskidev")}
      attribute="backgroundEffectColor2"
      attributes={attributes}
      setAttributes={setAttributes}
    />
    <EffectColorControl
      label={__("Effect color 3", "kotlinskidev")}
      attribute="backgroundEffectColor3"
      attributes={attributes}
      setAttributes={setAttributes}
    />
    <p className="components-base-control__help">
      {__(
        "Leave a color empty to keep the theme's default. Not every effect uses all three.",
        "kotlinskidev"
      )}
    </p>
    {attributes.backgroundEffect === GLOW_BORDER_EFFECT && (
      <p className="components-base-control__help">
        {__(
          "Only the color animates. Border width and radius come from this block's own Border settings; set them there.",
          "kotlinskidev"
        )}
      </p>
    )}
  </>
);

const EffectSelect = ({
  attributes,
  setAttributes,
  presetId,
}: Pick<BackgroundEffectPanelProps, "attributes" | "setAttributes"> & { presetId: number }) => (
  <SelectControl
    label={__("Effect", "kotlinskidev")}
    value={attributes.backgroundEffect || ""}
    options={backgroundEffects}
    onChange={(value: string) => setAttributes({ backgroundEffect: value })}
    disabled={presetId > 0}
    help={__(
      "Applies an animated CSS background/border effect. Shimmer Text is meant for text blocks; the others work best on containers and Cover blocks.",
      "kotlinskidev"
    )}
  />
);

export const BackgroundEffectPanel = ({
  attributes,
  setAttributes,
  presetOptions,
}: BackgroundEffectPanelProps) => {
  const { backgroundEffect, backgroundEffectPresetId } = attributes;
  const presetId = backgroundEffectPresetId ?? 0;

  return (
    <InspectorControls>
      <PanelBody title={__("Background Effects", "kotlinskidev")} icon="art" initialOpen={false}>
        <ComboboxControl
          key={`${presetId}-${presetOptions.length}`}
          label={__("Effect Preset", "kotlinskidev")}
          value={presetId ? String(presetId) : ""}
          options={presetOptions}
          onChange={(value) =>
            setAttributes({ backgroundEffectPresetId: value ? Number(value) : 0 })
          }
          allowReset
          help={__(
            "Manage presets from Background Effect Presets in the admin menu. Editing a preset there updates every block using it, with no code changes needed. Overrides the manual effect below when set.",
            "kotlinskidev"
          )}
        />
        <EffectSelect attributes={attributes} setAttributes={setAttributes} presetId={presetId} />
        {backgroundEffect && presetId === 0 && (
          <EffectColorsSection attributes={attributes} setAttributes={setAttributes} />
        )}
      </PanelBody>
    </InspectorControls>
  );
};
