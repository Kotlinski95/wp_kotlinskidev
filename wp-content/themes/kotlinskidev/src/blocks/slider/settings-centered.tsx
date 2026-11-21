import React from "react";
import {
  PanelRow,
  RangeControl,
  ToggleControl,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { DEFAULT_PEEK_PERCENT, DEFAULT_SLIDE_MAX_WIDTH, MAX_PEEK_PERCENT } from "./constants";
import { normalizeSlideMaxWidth, SLIDE_MAX_WIDTH_UNITS } from "./editor-layout";
import type { SliderSettingsProps } from "./slider-attributes";

const CenteredSlideDimensions = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <RangeControl
        label={__("Side peek (%)", "kotlinskidev")}
        value={attributes.peek}
        onChange={(value) => setAttributes({ peek: value ?? DEFAULT_PEEK_PERCENT })}
        min={0}
        max={MAX_PEEK_PERCENT}
        help={__(
          "How much of each side slide is visible, as a percentage of the carousel width, up to the max slide width below.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
    <PanelRow>
      <UnitControl
        label={__("Max slide width", "kotlinskidev")}
        value={normalizeSlideMaxWidth(attributes.slideMaxWidth)}
        units={SLIDE_MAX_WIDTH_UNITS}
        onChange={(value?: string) =>
          setAttributes({ slideMaxWidth: value || DEFAULT_SLIDE_MAX_WIDTH })
        }
        help={__(
          "Caps how wide the active slide can grow. On wider screens the slide stays this width, so more of the side slides peek in.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
  </>
);

export const CenteredSlidesSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Centered slides (peek effect)", "kotlinskidev")}
        checked={attributes.centerSlides}
        onChange={(value) => setAttributes({ centerSlides: value })}
        help={__(
          "Centers the active slide with the next/previous slides peeking in from the sides. Below tablet width, always shows a single full-width slide regardless of these settings. Use the block's own Wide/Full alignment for an edge-to-edge carousel.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
    {attributes.centerSlides && (
      <CenteredSlideDimensions attributes={attributes} setAttributes={setAttributes} />
    )}
  </>
);
