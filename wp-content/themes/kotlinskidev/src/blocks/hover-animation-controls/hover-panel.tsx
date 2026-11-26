import React from "react";
import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  CheckboxControl,
  ToggleControl,
  RangeControl,
} from "@wordpress/components";
import { combinableTransformEffects, hoverAnimations } from "./hover-options";
import { DEFAULT_OPACITY_FROM, DEFAULT_OPACITY_TO } from "./hover-attributes";
import type { HoverAnimationAttributes } from "./hover-attributes";

const MAX_OPACITY_PERCENT = 100;
const BUTTON_BLOCK_NAME = "kotlinskidev/button";

type ColorChangeHandler = (value: string | undefined) => void;

interface HoverPanelProps {
  blockName: string;
  attributes: HoverAnimationAttributes;
  setAttributes: (attributes: Partial<HoverAnimationAttributes>) => void;
  onBackgroundColorChange: ColorChangeHandler;
  onTextColorChange: ColorChangeHandler;
}

const HelpText = ({ children }: { children: string }) => (
  <p className="components-base-control__help">{children}</p>
);

const hasAnyHoverEffect = (attributes: HoverAnimationAttributes): boolean => {
  const {
    hoverAnimation,
    hoverAnimationExtra,
    hoverBackgroundColor,
    hoverTextColor,
    hoverOpacityEnabled,
    hoverBorderColor,
    hoverEnhancedGlow,
  } = attributes;

  return Boolean(
    hoverAnimation ||
    (Array.isArray(hoverAnimationExtra) && hoverAnimationExtra.length) ||
    hoverBackgroundColor ||
    hoverTextColor ||
    hoverOpacityEnabled ||
    hoverBorderColor ||
    hoverEnhancedGlow
  );
};

interface ExtraEffectCheckboxesProps {
  hoverAnimation: string | undefined;
  hoverAnimationExtra: string[] | undefined;
  setAttributes: HoverPanelProps["setAttributes"];
}

const ExtraEffectCheckboxes = ({
  hoverAnimation,
  hoverAnimationExtra,
  setAttributes,
}: ExtraEffectCheckboxesProps) => {
  const extraEffects: string[] = Array.isArray(hoverAnimationExtra) ? hoverAnimationExtra : [];

  const toggleExtraEffect = (value: string, checked: boolean) => {
    setAttributes({
      hoverAnimationExtra: checked
        ? [...extraEffects, value]
        : extraEffects.filter((effect) => effect !== value),
    });
  };

  return (
    <>
      {combinableTransformEffects
        .filter((effect) => effect.value !== hoverAnimation)
        .map((effect) => (
          <CheckboxControl
            key={effect.value}
            label={effect.label}
            checked={extraEffects.includes(effect.value)}
            onChange={(checked) => toggleExtraEffect(effect.value, checked)}
          />
        ))}
    </>
  );
};

const AnimationSection = ({
  attributes,
  setAttributes,
}: Pick<HoverPanelProps, "attributes" | "setAttributes">) => {
  const { hoverAnimation, hoverAnimationExtra } = attributes;

  return (
    <>
      <SelectControl
        label={__("Animation Type", "kotlinskidev")}
        value={hoverAnimation || ""}
        options={hoverAnimations}
        onChange={(value: string) => setAttributes({ hoverAnimation: value })}
        help={__(
          "Choose an animation that will trigger when hovering over the block.",
          "kotlinskidev"
        )}
      />
      {hoverAnimation === "hover-zoom-bg" && (
        <HelpText>
          {__(
            "Zooms only the block's own image/video on hover, keeping surrounding content still. Works on Image, Video, Gallery, Media & Text, and Cover blocks. Set a border radius in this block's own Border panel to keep rounded corners while zooming.",
            "kotlinskidev"
          )}
        </HelpText>
      )}
      <HelpText>
        {__(
          "Combine additional movement effects with the animation above — they'll play together on hover.",
          "kotlinskidev"
        )}
      </HelpText>
      <ExtraEffectCheckboxes
        hoverAnimation={hoverAnimation}
        hoverAnimationExtra={hoverAnimationExtra}
        setAttributes={setAttributes}
      />
    </>
  );
};

const OpacitySection = ({
  attributes,
  setAttributes,
}: Pick<HoverPanelProps, "attributes" | "setAttributes">) => {
  const { hoverOpacityEnabled, hoverOpacityFrom, hoverOpacityTo } = attributes;

  return (
    <>
      <ToggleControl
        label={__("Fade opacity on hover", "kotlinskidev")}
        checked={Boolean(hoverOpacityEnabled)}
        onChange={(checked) => setAttributes({ hoverOpacityEnabled: checked })}
      />
      {hoverOpacityEnabled && (
        <>
          <RangeControl
            label={__("Starting opacity", "kotlinskidev")}
            value={hoverOpacityFrom ?? DEFAULT_OPACITY_FROM}
            min={0}
            max={MAX_OPACITY_PERCENT}
            onChange={(value) => setAttributes({ hoverOpacityFrom: value ?? DEFAULT_OPACITY_FROM })}
          />
          <RangeControl
            label={__("Opacity on hover", "kotlinskidev")}
            value={hoverOpacityTo ?? DEFAULT_OPACITY_TO}
            min={0}
            max={MAX_OPACITY_PERCENT}
            onChange={(value) => setAttributes({ hoverOpacityTo: value ?? DEFAULT_OPACITY_TO })}
          />
        </>
      )}
    </>
  );
};

const BorderColorControl = ({
  attributes,
  setAttributes,
}: Pick<HoverPanelProps, "attributes" | "setAttributes">) => (
  <ColorGradientControl
    label={__("Hover border color", "kotlinskidev")}
    colorValue={attributes.hoverBorderColor || undefined}
    onColorChange={(value: string | undefined) => setAttributes({ hoverBorderColor: value || "" })}
    gradients={[]}
    disableCustomGradients
    enableAlpha={true}
    clearable={true}
    __experimentalIsRenderedInSidebar={true}
    __nextHasNoMarginBottom
  />
);

const GradientAwareColorControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: ColorChangeHandler;
}) => {
  const isGradient = (value || "").includes("gradient");

  return (
    <ColorGradientControl
      label={label}
      colorValue={value && !isGradient ? value : undefined}
      gradientValue={isGradient ? value : undefined}
      onColorChange={onChange}
      onGradientChange={onChange}
      enableAlpha={true}
      clearable={true}
      __experimentalIsRenderedInSidebar={true}
      __nextHasNoMarginBottom
    />
  );
};

const ColorSection = ({
  attributes,
  setAttributes,
  onBackgroundColorChange,
  onTextColorChange,
}: Omit<HoverPanelProps, "blockName">) => (
  <>
    <GradientAwareColorControl
      label={__("Hover background color", "kotlinskidev")}
      value={attributes.hoverBackgroundColor}
      onChange={onBackgroundColorChange}
    />
    <HelpText>
      {__(
        "Drag the color's alpha slider for a translucent hover background — e.g. white at 20% opacity.",
        "kotlinskidev"
      )}
    </HelpText>
    <GradientAwareColorControl
      label={__("Hover text color", "kotlinskidev")}
      value={attributes.hoverTextColor}
      onChange={onTextColorChange}
    />
    <BorderColorControl attributes={attributes} setAttributes={setAttributes} />
    <HelpText>
      {__(
        "Set a border width and style in this block's own Border panel first — this only changes the border's color on hover.",
        "kotlinskidev"
      )}
    </HelpText>
  </>
);

const TouchSection = ({
  attributes,
  setAttributes,
}: Pick<HoverPanelProps, "attributes" | "setAttributes">) => (
  <>
    {hasAnyHoverEffect(attributes) && (
      <>
        <ToggleControl
          label={__("Activate when centred on touch screens", "kotlinskidev")}
          checked={attributes.inViewHover !== false}
          onChange={(checked) => setAttributes({ inViewHover: checked })}
        />
        <HelpText>
          {__(
            "On touch screens there is no hover, so the hover effect plays while this block is the one nearest the centre of the screen.",
            "kotlinskidev"
          )}
        </HelpText>
      </>
    )}
  </>
);

const GlowSection = ({
  blockName,
  attributes,
  setAttributes,
}: Pick<HoverPanelProps, "blockName" | "attributes" | "setAttributes">) => (
  <>
    {blockName !== BUTTON_BLOCK_NAME && (
      <>
        <ToggleControl
          label={__("Enhanced hover effect (cursor glow)", "kotlinskidev")}
          checked={Boolean(attributes.hoverEnhancedGlow)}
          onChange={(checked) => setAttributes({ hoverEnhancedGlow: checked })}
        />
        <HelpText>
          {__(
            "A soft glow in the Hover text color above that follows the cursor, same size as the button glow effect. Set a Hover text color above for this to be visible — while this is on, that color only drives the glow and no longer recolors the whole text on hover.",
            "kotlinskidev"
          )}
        </HelpText>
      </>
    )}
  </>
);

export const HoverPanel = (props: HoverPanelProps) => (
  <InspectorControls>
    <PanelBody title={__("Hover Effects", "kotlinskidev")} icon="art" initialOpen={false}>
      <AnimationSection attributes={props.attributes} setAttributes={props.setAttributes} />
      <OpacitySection attributes={props.attributes} setAttributes={props.setAttributes} />
      <ColorSection
        attributes={props.attributes}
        setAttributes={props.setAttributes}
        onBackgroundColorChange={props.onBackgroundColorChange}
        onTextColorChange={props.onTextColorChange}
      />
      <TouchSection attributes={props.attributes} setAttributes={props.setAttributes} />
      <GlowSection
        blockName={props.blockName}
        attributes={props.attributes}
        setAttributes={props.setAttributes}
      />
    </PanelBody>
  </InspectorControls>
);
