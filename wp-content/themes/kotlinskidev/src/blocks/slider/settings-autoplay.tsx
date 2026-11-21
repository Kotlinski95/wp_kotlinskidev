import React from "react";
import { PanelRow, RangeControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { MAX_AUTOPLAY_SECONDS, MIN_AUTOPLAY_SECONDS } from "./constants";
import type { SliderSettingsProps } from "./slider-attributes";

const AutoplayToggle = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <ToggleControl
      label={__("Autoplay", "kotlinskidev")}
      checked={attributes.autoplay}
      onChange={(value) => setAttributes({ autoplay: value })}
      help={__(
        "“Autoplay” will automatically advance the slides. Note: this is intentionally disabled in the editor, but will affect the front end.",
        "kotlinskidev"
      )}
    />
  </PanelRow>
);

const ContinuousAutoplayToggle = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <ToggleControl
      label={__("Continuous Autoplay", "kotlinskidev")}
      checked={attributes.continuousAutoplay}
      onChange={(value) => setAttributes({ continuousAutoplay: value })}
      help={__(
        "Scrolls continuously (like a ticker) instead of pausing between slides. Starts once the carousel scrolls into view, and pauses on hover or keyboard focus, resuming once the pointer or focus leaves.",
        "kotlinskidev"
      )}
    />
  </PanelRow>
);

const ProgressCircleToggle = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <ToggleControl
      label={__("Show progress circle", "kotlinskidev")}
      checked={attributes.showProgress}
      onChange={(value) => setAttributes({ showProgress: value })}
      help={__(
        "Displays a circular countdown indicator that fills up before each automatic slide change.",
        "kotlinskidev"
      )}
    />
  </PanelRow>
);

export const AutoplaySettings = (props: SliderSettingsProps) => (
  <>
    <AutoplayToggle {...props} />
    {props.attributes.autoplay && <ContinuousAutoplayToggle {...props} />}
    {props.attributes.autoplay && !props.attributes.continuousAutoplay && (
      <ProgressCircleToggle {...props} />
    )}
  </>
);

export const AutoplayTimeSetting = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <RangeControl
      label={__("Autoplay Time (seconds)", "kotlinskidev")}
      value={attributes.autoplayTime}
      onChange={(value) => setAttributes({ autoplayTime: value })}
      min={MIN_AUTOPLAY_SECONDS}
      max={MAX_AUTOPLAY_SECONDS}
      help={
        attributes.continuousAutoplay
          ? __("Set how long one full continuous scroll cycle takes, in seconds.", "kotlinskidev")
          : __("Set the autoplay interval in seconds.", "kotlinskidev")
      }
    />
  </PanelRow>
);

export const SmoothTransitionSetting = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <ToggleControl
      label={__("Smooth Transition", "kotlinskidev")}
      checked={attributes.smoothTransition}
      onChange={(value) => setAttributes({ smoothTransition: value })}
      help={__("Uses a linear easing curve for a smoother feel between slides.", "kotlinskidev")}
    />
  </PanelRow>
);
