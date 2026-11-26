import React from "react";
import {
  ColorPalette,
  PanelBody,
  SelectControl,
  TextareaControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { VARIANT_OPTIONS } from "./variant-options";
import type { FeatureCardCanvasAttributes, PaletteEntry } from "./attributes";
import type { FeatureCanvasTrigger, FeatureCanvasVariant } from "./types";

interface PanelProps {
  attributes: FeatureCardCanvasAttributes;
  setAttributes: (attrs: Partial<FeatureCardCanvasAttributes>) => void;
}

const LabelFields = ({ attributes, setAttributes }: PanelProps): JSX.Element => {
  const { labelOne, labelTwo, labelThree } = attributes;

  return (
    <>
      <TextControl
        label={__("Label one", "kotlinskidev")}
        value={labelOne}
        onChange={(value) => setAttributes({ labelOne: value })}
      />
      <TextControl
        label={__("Label two", "kotlinskidev")}
        value={labelTwo}
        onChange={(value) => setAttributes({ labelTwo: value })}
      />
      <TextControl
        label={__("Label three", "kotlinskidev")}
        value={labelThree}
        onChange={(value) => setAttributes({ labelThree: value })}
      />
    </>
  );
};

export const CanvasPanel = ({ attributes, setAttributes }: PanelProps): JSX.Element => {
  const { variant, aspectRatio, description } = attributes;

  return (
    <PanelBody title={__("Canvas", "kotlinskidev")} initialOpen>
      <SelectControl
        label={__("Variant", "kotlinskidev")}
        value={variant}
        options={VARIANT_OPTIONS.map((option) => ({ ...option }))}
        onChange={(value) => setAttributes({ variant: value as FeatureCanvasVariant })}
      />
      <TextControl
        label={__("Aspect ratio", "kotlinskidev")}
        help={__("CSS aspect-ratio value, e.g. 16/9.", "kotlinskidev")}
        value={aspectRatio}
        onChange={(value) => setAttributes({ aspectRatio: value })}
      />
      <LabelFields attributes={attributes} setAttributes={setAttributes} />
      <TextareaControl
        label={__("Accessible description", "kotlinskidev")}
        help={__(
          "Describe what the illustration shows when it carries information the nearby text does not. Leave empty to hide it from assistive technology as decoration.",
          "kotlinskidev"
        )}
        value={description}
        onChange={(value) => setAttributes({ description: value })}
      />
    </PanelBody>
  );
};

interface ColourPanelProps extends PanelProps {
  palette: PaletteEntry[];
}

export const ColourPanel = ({
  attributes,
  setAttributes,
  palette,
}: ColourPanelProps): JSX.Element => {
  const accentValue = palette.find((entry) => entry.slug === attributes.accentColor)?.color;

  return (
    <PanelBody title={__("Colour", "kotlinskidev")} initialOpen={false}>
      <ColorPalette
        colors={palette.map(({ name, color }) => ({ name, color }))}
        value={accentValue}
        disableCustomColors
        clearable
        onChange={(color) =>
          setAttributes({
            accentColor: palette.find((entry) => entry.color === color)?.slug ?? "",
          })
        }
      />
    </PanelBody>
  );
};

export const AnimationPanel = ({ attributes, setAttributes }: PanelProps): JSX.Element => {
  const { trigger, touchAutoplay } = attributes;

  return (
    <PanelBody title={__("Animation", "kotlinskidev")} initialOpen={false}>
      <SelectControl
        label={__("Animate", "kotlinskidev")}
        value={trigger}
        options={[
          { label: __("On hover", "kotlinskidev"), value: "hover" },
          { label: __("When in view", "kotlinskidev"), value: "in-view" },
        ]}
        help={__(
          "When in view, the illustration plays as it scrolls into view and resets once it leaves.",
          "kotlinskidev"
        )}
        onChange={(value) => setAttributes({ trigger: value as FeatureCanvasTrigger })}
      />
      <ToggleControl
        label={__("Animate automatically on touch devices", "kotlinskidev")}
        help={__(
          "Touch screens have no hover, so the illustration animates while the card is in the middle of the viewport.",
          "kotlinskidev"
        )}
        checked={touchAutoplay}
        onChange={(value) => setAttributes({ touchAutoplay: value })}
      />
    </PanelBody>
  );
};
