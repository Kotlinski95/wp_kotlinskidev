import React from "react";
import { __ } from "@wordpress/i18n";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import {
  ANIMATION_TRANSLATE_OPTIONS,
  buildAnimationTypeOptions,
  supportsDistanceControl,
} from "@utils/animation-options";
import type { ScrollAnimationAttributes } from "./scroll-animation-attributes";

const scrollAnimations = buildAnimationTypeOptions("scroll");

const scrollAnimationDelays = [
  { label: __("No Delay", "kotlinskidev"), value: "" },
  { label: __("100ms", "kotlinskidev"), value: "delay-100" },
  { label: __("200ms", "kotlinskidev"), value: "delay-200" },
  { label: __("300ms", "kotlinskidev"), value: "delay-300" },
  { label: __("500ms", "kotlinskidev"), value: "delay-500" },
  { label: __("750ms", "kotlinskidev"), value: "delay-750" },
  { label: __("1000ms", "kotlinskidev"), value: "delay-1000" },
];

interface ScrollAnimationPanelProps {
  attributes: ScrollAnimationAttributes;
  setAttributes: (attributes: Partial<ScrollAnimationAttributes>) => void;
}

export const ScrollAnimationPanel = ({ attributes, setAttributes }: ScrollAnimationPanelProps) => {
  const { scrollAnimation, scrollAnimationDelay, scrollAnimationTranslate } = attributes;

  return (
    <InspectorControls>
      <PanelBody title={__("Scroll Animations", "kotlinskidev")} icon="art" initialOpen={false}>
        <SelectControl
          label={__("Animation Type", "kotlinskidev")}
          value={scrollAnimation || ""}
          options={scrollAnimations}
          onChange={(value: string) => setAttributes({ scrollAnimation: value })}
          help={__(
            "Choose an animation that will trigger when the block comes into view.",
            "kotlinskidev"
          )}
        />
        <SelectControl
          label={__("Animation Delay", "kotlinskidev")}
          value={scrollAnimationDelay || ""}
          options={scrollAnimationDelays}
          onChange={(value: string) => setAttributes({ scrollAnimationDelay: value })}
          help={__("Set a delay before the animation starts.", "kotlinskidev")}
        />
        {supportsDistanceControl(scrollAnimation || "") && (
          <SelectControl
            label={__("Animation Distance", "kotlinskidev")}
            value={scrollAnimationTranslate || ""}
            options={ANIMATION_TRANSLATE_OPTIONS}
            onChange={(value: string) => setAttributes({ scrollAnimationTranslate: value })}
            help={__("Control how far elements move during fade/slide animations.", "kotlinskidev")}
          />
        )}
      </PanelBody>
    </InspectorControls>
  );
};
