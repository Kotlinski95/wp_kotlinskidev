import React from "react";
import { useSettings } from "@wordpress/block-editor";
import { ColorPalette, PanelRow, RangeControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
  DEFAULT_HIGHLIGHT_STRENGTH,
  MAX_HIGHLIGHT_STRENGTH,
  MIN_HIGHLIGHT_STRENGTH,
} from "./constants";
import { toPaletteEntries } from "./editor-layout";
import type { SliderSettingsProps } from "./slider-attributes";

const HighlightColorSettings = ({ attributes, setAttributes }: SliderSettingsProps) => {
  const [rawHighlightPalette] = useSettings("color.palette");
  const highlightPalette = toPaletteEntries(rawHighlightPalette);
  const highlightColorValue = highlightPalette.find(
    (entry) => entry.slug === attributes.activeHighlightColor
  )?.color;

  return (
    <>
      <PanelRow>
        <ColorPalette
          colors={highlightPalette.map(({ name, color }) => ({ name, color }))}
          value={highlightColorValue}
          disableCustomColors
          clearable
          onChange={(color) =>
            setAttributes({
              activeHighlightColor:
                highlightPalette.find((entry) => entry.color === color)?.slug ?? "",
            })
          }
        />
      </PanelRow>
      <PanelRow>
        <RangeControl
          label={__("Highlight strength (%)", "kotlinskidev")}
          value={attributes.activeHighlightStrength ?? DEFAULT_HIGHLIGHT_STRENGTH}
          min={MIN_HIGHLIGHT_STRENGTH}
          max={MAX_HIGHLIGHT_STRENGTH}
          onChange={(value) =>
            setAttributes({ activeHighlightStrength: value ?? DEFAULT_HIGHLIGHT_STRENGTH })
          }
          __nextHasNoMarginBottom
        />
      </PanelRow>
    </>
  );
};

export const HighlightSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Equal slide height", "kotlinskidev")}
        checked={attributes.equalSlideHeight ?? false}
        onChange={(value) => setAttributes({ equalSlideHeight: value })}
        help={__(
          "Stretches every slide to the height of the tallest one so the slider never jumps.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
    <PanelRow>
      <ToggleControl
        label={__("Highlight active slide", "kotlinskidev")}
        checked={attributes.highlightActiveSlide ?? false}
        onChange={(value) => setAttributes({ highlightActiveSlide: value })}
      />
    </PanelRow>
    {attributes.highlightActiveSlide && (
      <HighlightColorSettings attributes={attributes} setAttributes={setAttributes} />
    )}
  </>
);
