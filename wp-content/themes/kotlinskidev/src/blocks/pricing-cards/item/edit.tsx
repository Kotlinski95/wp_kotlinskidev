import React, { useRef } from "react";
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  useSettings,
} from "@wordpress/block-editor";
import { BaseControl, FontSizePicker, PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ColorGradientControl } from "../../shared/color-gradient-control";

interface ThemeFontSize {
  name: string;
  slug: string;
  size: string;
}

const ITEM_TEMPLATE: [string, object][] = [
  ["core/paragraph", { placeholder: "TIER NAME", fontSize: "small" }],
  ["core/heading", { level: 3, fontSize: "x-large", placeholder: "Price" }],
  ["core/paragraph", { placeholder: "Short description of who this tier is for" }],
  ["core/list", { placeholder: "Feature" }],
  ["core/paragraph", { placeholder: "Timeframe (optional)", fontSize: "small" }],
  ["core/buttons", {}],
];

interface PricingCardAttributes {
  featured: boolean;
  badgeFontSize: string;
  badgeTextColor: string;
  badgeGradient: string;
}

interface PricingCardEditProps {
  attributes: PricingCardAttributes;
  setAttributes: (attrs: Partial<PricingCardAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: PricingCardEditProps) {
  const { featured, badgeFontSize, badgeTextColor, badgeGradient } = attributes;

  const [customFontSizes, themeFontSizes] = useSettings(
    "typography.fontSizes.custom",
    "typography.fontSizes.theme"
  ) as [ThemeFontSize[] | undefined, ThemeFontSize[] | undefined];
  const fontSizes = [...(customFontSizes ?? []), ...(themeFontSizes ?? [])];

  // The color/gradient duo control fires the *other* value's onChange(undefined) in the same
  // tick as the one the user picked, and both callbacks close over the same pre-click
  // attributes — refs let each handler read/write the freshest value synchronously instead of a
  // stale one, so picking a gradient can't be undone by the color callback firing right after.
  const badgeTextColorRef = useRef(badgeTextColor);
  badgeTextColorRef.current = badgeTextColor;
  const badgeGradientRef = useRef(badgeGradient);
  badgeGradientRef.current = badgeGradient;

  const setBadgeTextColor = (value?: string) => {
    badgeTextColorRef.current = value || "";
    if (value) {
      badgeGradientRef.current = "";
    }
    setAttributes({
      badgeTextColor: badgeTextColorRef.current,
      badgeGradient: badgeGradientRef.current,
    });
  };

  const setBadgeGradient = (value?: string) => {
    badgeGradientRef.current = value || "";
    if (value) {
      badgeTextColorRef.current = "";
    }
    setAttributes({
      badgeTextColor: badgeTextColorRef.current,
      badgeGradient: badgeGradientRef.current,
    });
  };

  let badgeColorStyle: React.CSSProperties = {};
  if (badgeGradient) {
    badgeColorStyle = {
      backgroundImage: badgeGradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  } else if (badgeTextColor) {
    badgeColorStyle = { color: badgeTextColor };
  }

  const badgeStyle: React.CSSProperties = {
    ...(badgeFontSize ? { fontSize: badgeFontSize } : {}),
    ...badgeColorStyle,
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Pricing Card", "kotlinskidev")} initialOpen>
          <ToggleControl
            label={__("Highlight as most popular", "kotlinskidev")}
            checked={featured}
            onChange={(value) => setAttributes({ featured: value })}
            help={__(
              "Adds a badge and an accent border to draw attention to this tier.",
              "kotlinskidev"
            )}
          />

          {featured && (
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
          )}
        </PanelBody>
      </InspectorControls>

      <div
        {...useBlockProps({
          className: `pricing-card${featured ? " pricing-card--featured" : ""}`,
        })}
      >
        {featured && (
          <span className="pricing-card__badge" style={badgeStyle}>
            {__("Most popular", "kotlinskidev")}
          </span>
        )}
        <div className="pricing-card__body">
          <InnerBlocks template={ITEM_TEMPLATE} />
        </div>
      </div>
    </>
  );
}
