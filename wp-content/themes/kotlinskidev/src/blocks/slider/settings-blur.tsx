import React from "react";
import { PanelRow, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { BlurAmountControl } from "../shared/blur-amount-control";
import type { SliderSettingsProps } from "./slider-attributes";

export const BlurSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Blur other slides on hover", "kotlinskidev")}
        checked={attributes.blurOtherSlides}
        onChange={(value) => setAttributes({ blurOtherSlides: value })}
        help={__("Blurs and dims every slide except the hovered one.", "kotlinskidev")}
      />
    </PanelRow>
    {attributes.blurOtherSlides && (
      <BlurAmountControl
        value={attributes.blurAmount}
        onChange={(value) => setAttributes({ blurAmount: value })}
      />
    )}
  </>
);
