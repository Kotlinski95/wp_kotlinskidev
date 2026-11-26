import React from "react";
import { __ } from "@wordpress/i18n";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl, RangeControl, ToggleControl } from "@wordpress/components";
import { DEFAULT_COUNTER_DURATION_MS, DEFAULT_COUNTER_EASING } from "./counter-attributes";
import type { CounterAnimationAttributes } from "./counter-attributes";

const MIN_CUSTOM_DURATION_MS = 500;
const MAX_CUSTOM_DURATION_MS = 10000;
const CUSTOM_DURATION_STEP_MS = 100;

const animationDurations = [
  { label: __("Fast (1s)", "kotlinskidev"), value: "1000" },
  { label: __("Normal (2s)", "kotlinskidev"), value: "2000" },
  { label: __("Slow (3s)", "kotlinskidev"), value: "3000" },
  { label: __("Very Slow (4s)", "kotlinskidev"), value: "4000" },
  { label: __("Custom", "kotlinskidev"), value: "custom" },
];

const easingFunctions = [
  { label: __("Linear", "kotlinskidev"), value: "linear" },
  { label: __("Ease Out", "kotlinskidev"), value: "easeOut" },
  { label: __("Ease In Out", "kotlinskidev"), value: "easeInOut" },
  { label: __("Bounce", "kotlinskidev"), value: "bounce" },
];

interface CounterPanelProps {
  attributes: CounterAnimationAttributes;
  setAttributes: (attributes: Partial<CounterAnimationAttributes>) => void;
}

const HowItWorksNote = () => (
  <div
    style={{
      padding: "12px",
      backgroundColor: "#f0f6fc",
      borderRadius: "4px",
      marginBottom: "16px",
      border: "1px solid #0073aa",
    }}
  >
    <p
      style={{
        margin: "0 0 8px 0",
        fontSize: "0.8125rem",
        fontWeight: "600",
        color: "#0073aa",
      }}
    >
      {__("💡 How it works:", "kotlinskidev")}
    </p>
    <p
      style={{
        margin: "0",
        fontSize: "0.75rem",
        color: "#555",
        lineHeight: "1.4",
      }}
    >
      {__(
        'Just type your text with numbers like "5 years", "98%", or "$1,250". The system will automatically detect the numbers and animate them from 0 to the detected value.',
        "kotlinskidev"
      )}
    </p>
  </div>
);

const CounterOptions = ({ attributes, setAttributes }: CounterPanelProps) => {
  const { counterDuration, counterCustomDuration, counterEasing } = attributes;

  return (
    <Fragment>
      <HowItWorksNote />

      <SelectControl
        label={__("Animation Duration", "kotlinskidev")}
        value={counterDuration || "2000"}
        options={animationDurations}
        onChange={(value: string) => setAttributes({ counterDuration: value })}
        help={__("How long the counting animation should take.", "kotlinskidev")}
      />

      {counterDuration === "custom" && (
        <RangeControl
          label={__("Custom Duration (ms)", "kotlinskidev")}
          value={counterCustomDuration || DEFAULT_COUNTER_DURATION_MS}
          onChange={(value: number) => setAttributes({ counterCustomDuration: value })}
          min={MIN_CUSTOM_DURATION_MS}
          max={MAX_CUSTOM_DURATION_MS}
          step={CUSTOM_DURATION_STEP_MS}
        />
      )}

      <SelectControl
        label={__("Animation Easing", "kotlinskidev")}
        value={counterEasing || DEFAULT_COUNTER_EASING}
        options={easingFunctions}
        onChange={(value: string) => setAttributes({ counterEasing: value })}
        help={__("The animation style (how fast/slow it accelerates).", "kotlinskidev")}
      />
    </Fragment>
  );
};

export const CounterPanel = ({ attributes, setAttributes }: CounterPanelProps) => (
  <InspectorControls>
    <PanelBody title={__("Animated Counter", "kotlinskidev")} icon="chart-line" initialOpen={false}>
      <ToggleControl
        label={__("Enable Counter Animation", "kotlinskidev")}
        checked={attributes.enableCounter || false}
        onChange={(value: boolean) => setAttributes({ enableCounter: value })}
        help={__(
          "Turn this block into an animated counter. Numbers in your text will automatically count up from 0 when the block comes into view.",
          "kotlinskidev"
        )}
      />

      {attributes.enableCounter && (
        <CounterOptions attributes={attributes} setAttributes={setAttributes} />
      )}
    </PanelBody>
  </InspectorControls>
);
