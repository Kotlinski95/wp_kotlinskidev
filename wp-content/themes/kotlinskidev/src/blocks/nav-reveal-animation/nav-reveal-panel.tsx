import React from "react";
import { __ } from "@wordpress/i18n";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import {
  ANIMATION_TRANSLATE_OPTIONS,
  buildAnimationTypeOptions,
  supportsDistanceControl,
} from "@utils/animation-options";
import type { NavRevealAttributes } from "./nav-reveal-attributes";

const REVEAL_DELAY_STEP_MS = 10;

const navRevealAnimations = buildAnimationTypeOptions("reveal");

interface NavRevealPanelProps {
  attributes: NavRevealAttributes;
  setAttributes: (attributes: Partial<NavRevealAttributes>) => void;
}

const RevealDelayField = ({ attributes, setAttributes }: NavRevealPanelProps) => (
  <NumberControl
    label={__("Reveal Delay (ms)", "kotlinskidev")}
    value={attributes.navRevealDelay || 0}
    min={0}
    step={REVEAL_DELAY_STEP_MS}
    onChange={(value?: string) => setAttributes({ navRevealDelay: Number(value) || 0 })}
    help={__(
      "Stagger links by setting an increasing delay on each one, e.g. 50, 100, 150.",
      "kotlinskidev"
    )}
  />
);

const RevealDistanceField = ({ attributes, setAttributes }: NavRevealPanelProps) => (
  <SelectControl
    label={__("Animation Distance", "kotlinskidev")}
    value={attributes.navRevealTranslate || ""}
    options={ANIMATION_TRANSLATE_OPTIONS}
    onChange={(value: string) => setAttributes({ navRevealTranslate: value })}
    help={__("Control how far elements move during fade/slide animations.", "kotlinskidev")}
  />
);

export const NavRevealPanel = ({ attributes, setAttributes }: NavRevealPanelProps) => {
  const { navRevealAnimation } = attributes;

  return (
    <InspectorControls>
      <PanelBody
        title={__("Reveal on Menu Open", "kotlinskidev")}
        icon="controls-forward"
        initialOpen={false}
      >
        <SelectControl
          label={__("Animation Type", "kotlinskidev")}
          value={navRevealAnimation || ""}
          options={navRevealAnimations}
          onChange={(value: string) => setAttributes({ navRevealAnimation: value })}
          help={__(
            "Choose an animation that will trigger when the enclosing nav panel, hamburger menu, or dropdown opens.",
            "kotlinskidev"
          )}
        />
        {navRevealAnimation && (
          <RevealDelayField attributes={attributes} setAttributes={setAttributes} />
        )}
        {supportsDistanceControl(navRevealAnimation || "") && (
          <RevealDistanceField attributes={attributes} setAttributes={setAttributes} />
        )}
      </PanelBody>
    </InspectorControls>
  );
};
