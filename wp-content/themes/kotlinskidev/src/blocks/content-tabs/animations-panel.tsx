import React from "react";
import { PanelBody, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { ContentTabsSettingsProps } from "./content-tabs-attributes";

const PANEL_TRANSITION_OPTIONS = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Fade", "kotlinskidev"), value: "fade" },
];

const CARD_ANIMATION_OPTIONS = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Fade Up", "kotlinskidev"), value: "fade-up" },
];

export const AnimationsPanel = ({ attributes, setAttributes }: ContentTabsSettingsProps) => (
  <PanelBody title={__("Animations", "kotlinskidev")} initialOpen={false}>
    <SelectControl
      label={__("Tab switch animation", "kotlinskidev")}
      value={attributes.panelTransition}
      options={PANEL_TRANSITION_OPTIONS}
      help={__(
        "How the old panel disappears and the new one appears when switching tabs.",
        "kotlinskidev"
      )}
      onChange={(value) => setAttributes({ panelTransition: value })}
    />
    <SelectControl
      label={__("Card entrance animation", "kotlinskidev")}
      value={attributes.cardAnimation}
      options={CARD_ANIMATION_OPTIONS}
      help={__(
        "Animates project/article cards inside the newly shown tab, one after another.",
        "kotlinskidev"
      )}
      onChange={(value) => setAttributes({ cardAnimation: value })}
    />
  </PanelBody>
);
