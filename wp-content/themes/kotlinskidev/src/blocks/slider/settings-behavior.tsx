import React from "react";
import { PanelRow, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { SliderSettingsProps } from "./slider-attributes";

export const LoopAndDragSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Scrollbar", "kotlinskidev")}
        checked={attributes.scrollbar}
        onChange={(value) => setAttributes({ scrollbar: value })}
        help={__("Enable or disable the scrollbar.", "kotlinskidev")}
      />
    </PanelRow>
    <PanelRow>
      <ToggleControl
        label={__("Loop", "kotlinskidev")}
        checked={attributes.loop}
        onChange={(value) => setAttributes({ loop: value })}
        help={__("Enable or disable looping of slides.", "kotlinskidev")}
      />
    </PanelRow>
    <PanelRow>
      <ToggleControl
        label={__("Draggable", "kotlinskidev")}
        checked={attributes.draggable}
        onChange={(value) => setAttributes({ draggable: value })}
        help={__(
          "Lets users manually swipe/drag the slides. Keep this on to allow manual swiping even during Continuous Autoplay.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
  </>
);

export const InputSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Mousewheel", "kotlinskidev")}
        checked={attributes.mousewheel}
        onChange={(value) => setAttributes({ mousewheel: value })}
        help={__("Enable navigation with mouse wheel scrolling.", "kotlinskidev")}
      />
    </PanelRow>
    <PanelRow>
      <ToggleControl
        label={__("Keyboard Navigation", "kotlinskidev")}
        checked={attributes.keyboard}
        onChange={(value) => setAttributes({ keyboard: value })}
        help={__("Enable navigation with keyboard arrow keys.", "kotlinskidev")}
      />
    </PanelRow>
  </>
);
