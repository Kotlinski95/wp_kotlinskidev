import React from "react";
import { InspectorControls, useSettings } from "@wordpress/block-editor";
import { BaseControl, FontSizePicker, PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ColorGradientControl } from "../../shared/color-gradient-control";
import { useBadgeColorSetters } from "./use-badge-color-setters";

interface ThemeFontSize {
  name: string;
  slug: string;
  size: string;
}

export interface PricingCardAttributes {
  featured: boolean;
  badgeFontSize: string;
  badgeTextColor: string;
  badgeGradient: string;
}

interface BadgePanelProps {
  attributes: PricingCardAttributes;
  setAttributes: (attrs: Partial<PricingCardAttributes>) => void;
}

const useThemeFontSizes = (): ThemeFontSize[] => {
  const [customFontSizes, themeFontSizes] = useSettings(
    "typography.fontSizes.custom",
    "typography.fontSizes.theme"
  ) as [ThemeFontSize[] | undefined, ThemeFontSize[] | undefined];
  return [...(customFontSizes ?? []), ...(themeFontSizes ?? [])];
};

const BadgeSettings = ({ attributes, setAttributes }: BadgePanelProps): JSX.Element => {
  const { badgeFontSize, badgeTextColor, badgeGradient } = attributes;
  const fontSizes = useThemeFontSizes();
  const { setBadgeTextColor, setBadgeGradient } = useBadgeColorSetters(
    { badgeTextColor, badgeGradient },
    setAttributes
  );

  return (
    <>
      <BaseControl
        label={__("Badge font size", "kotlinskidev")}
        id="kt-pricing-card-badge-font-size"
      >
        <FontSizePicker
          value={badgeFontSize || undefined}
          fontSizes={fontSizes}
          onChange={(value) => setAttributes({ badgeFontSize: value ?? "" })}
        />
      </BaseControl>

      <ColorGradientControl
        label={__("Badge text color", "kotlinskidev")}
        colorValue={badgeTextColor || undefined}
        gradientValue={badgeGradient || undefined}
        onColorChange={setBadgeTextColor}
        onGradientChange={setBadgeGradient}
        clearable
      />
    </>
  );
};

export const BadgePanel = ({ attributes, setAttributes }: BadgePanelProps): JSX.Element => (
  <InspectorControls>
    <PanelBody title={__("Pricing Card", "kotlinskidev")} initialOpen>
      <ToggleControl
        label={__("Highlight as most popular", "kotlinskidev")}
        checked={attributes.featured}
        onChange={(value) => setAttributes({ featured: value })}
        help={__(
          "Adds a badge and an accent border to draw attention to this tier.",
          "kotlinskidev"
        )}
      />

      {attributes.featured && (
        <BadgeSettings attributes={attributes} setAttributes={setAttributes} />
      )}
    </PanelBody>
  </InspectorControls>
);
