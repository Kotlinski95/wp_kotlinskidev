import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { SliderSettingsProps } from "./slider-attributes";
import {
  AutoplaySettings,
  AutoplayTimeSetting,
  SmoothTransitionSetting,
} from "./settings-autoplay";
import { InputSettings, LoopAndDragSettings } from "./settings-behavior";
import { BlurSettings } from "./settings-blur";
import { CenteredSlidesSettings } from "./settings-centered";
import { HighlightSettings } from "./settings-highlight";
import { NavigationSettings, PaginationPlacementSetting } from "./settings-navigation";
import { ResponsiveSettings } from "./settings-responsive";

export const SliderSettingsPanel = (props: SliderSettingsProps) => (
  <InspectorControls>
    <PanelBody title={__("Settings", "kotlinskidev")}>
      <AutoplaySettings {...props} />
      <NavigationSettings {...props} />
      <HighlightSettings {...props} />
      <PaginationPlacementSetting {...props} />
      <SmoothTransitionSetting {...props} />
      <AutoplayTimeSetting {...props} />
      <ResponsiveSettings {...props} />
      <LoopAndDragSettings {...props} />
      <CenteredSlidesSettings {...props} />
      <InputSettings {...props} />
      <BlurSettings {...props} />
    </PanelBody>
  </InspectorControls>
);
