import React from "react";
import { InspectorControls, useBlockProps, useSettings } from "@wordpress/block-editor";
import {
  ColorPalette,
  PanelBody,
  SelectControl,
  TextareaControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { useEffect, useRef } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { mountFeatureCanvas } from "./runtime";
import type { FeatureCanvasTrigger, FeatureCanvasVariant } from "./types";

export interface FeatureCardCanvasAttributes {
  variant: FeatureCanvasVariant;
  aspectRatio: string;
  labelOne: string;
  labelTwo: string;
  labelThree: string;
  description: string;
  accentColor: string;
  touchAutoplay: boolean;
  trigger: FeatureCanvasTrigger;
}

interface PaletteEntry {
  name: string;
  slug: string;
  color: string;
}

interface EditProps {
  attributes: FeatureCardCanvasAttributes;
  setAttributes: (attrs: Partial<FeatureCardCanvasAttributes>) => void;
}

const VARIANT_OPTIONS: ReadonlyArray<{ label: string; value: FeatureCanvasVariant }> = [
  { label: __("Browser stream", "kotlinskidev"), value: "browser-stream" },
  { label: __("Node tree", "kotlinskidev"), value: "node-tree" },
  { label: __("Dot image stack", "kotlinskidev"), value: "dot-image-stack" },
  { label: __("Chart growth", "kotlinskidev"), value: "chart-growth" },
  { label: __("Storefront", "kotlinskidev"), value: "storefront" },
  { label: __("Layout builder", "kotlinskidev"), value: "layout-builder" },
  { label: __("Speed gauge", "kotlinskidev"), value: "speed-gauge" },
  { label: __("Navigation · About", "kotlinskidev"), value: "nav-about" },
  { label: __("Navigation · Projects", "kotlinskidev"), value: "nav-projects" },
  { label: __("Navigation · Services", "kotlinskidev"), value: "nav-services" },
  { label: __("Navigation · Contact", "kotlinskidev"), value: "nav-contact" },
  { label: __("City · Company site", "kotlinskidev"), value: "site-scroll" },
  { label: __("City · Checkout", "kotlinskidev"), value: "checkout-flow" },
  { label: __("City · App dashboard", "kotlinskidev"), value: "app-dashboard" },
  { label: __("City · Load waterfall", "kotlinskidev"), value: "load-waterfall" },
  { label: __("City · Local search", "kotlinskidev"), value: "local-search" },
  { label: __("City · Support shield", "kotlinskidev"), value: "support-shield" },
  { label: __("Benefit · Marketing", "kotlinskidev"), value: "benefit-marketing" },
  { label: __("Benefit · SaaS", "kotlinskidev"), value: "benefit-saas" },
  { label: __("Benefit · Design system", "kotlinskidev"), value: "benefit-design-system" },
  { label: __("Benefit · API", "kotlinskidev"), value: "benefit-api" },
  { label: __("Commerce · Conversion", "kotlinskidev"), value: "commerce-conversion" },
  { label: __("Commerce · Scale", "kotlinskidev"), value: "commerce-scale" },
  { label: __("Commerce · Secure", "kotlinskidev"), value: "commerce-secure" },
  { label: __("Commerce · Platforms", "kotlinskidev"), value: "commerce-platforms" },
  { label: __("Illustration · Storefront", "kotlinskidev"), value: "illus-storefront" },
  { label: __("Illustration · Audit", "kotlinskidev"), value: "illus-audit" },
  { label: __("Illustration · Mobile first", "kotlinskidev"), value: "illus-mobile-first" },
  { label: __("Illustration · Web vitals", "kotlinskidev"), value: "illus-vitals" },
  { label: __("Illustration · Mobile checkout", "kotlinskidev"), value: "illus-mobile-checkout" },
  { label: __("Illustration · SEO growth", "kotlinskidev"), value: "illus-seo-growth" },
  { label: __("Illustration · Handover", "kotlinskidev"), value: "illus-handover" },
  { label: __("Illustration · App & services", "kotlinskidev"), value: "illus-app-services" },
  { label: __("Illustration · Framework comparison", "kotlinskidev"), value: "vs-frameworks" },
  { label: __("Illustration · PWA", "kotlinskidev"), value: "pwa-install" },
  {
    label: __("Illustration · SSR & SmartEdit", "kotlinskidev"),
    value: "ssr-smartedit",
  },
  {
    label: __("Illustration · Next.js architecture", "kotlinskidev"),
    value: "nextjs-architecture",
  },
  { label: __("Illustration · Performance by design", "kotlinskidev"), value: "perf-by-design" },
  { label: __("Illustration · Smart shopping list", "kotlinskidev"), value: "smart-shopping-list" },
  { label: __("Illustration · WordPress custom theme", "kotlinskidev"), value: "wp-custom-theme" },
  {
    label: __("Illustration · WordPress stack ownership", "kotlinskidev"),
    value: "wp-stack-ownership",
  },
  {
    label: __("Illustration · WordPress flexibility & control", "kotlinskidev"),
    value: "wp-flex-control",
  },
];

const toEntries = (raw: unknown): PaletteEntry[] => {
  if (Array.isArray(raw)) {
    return raw as PaletteEntry[];
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).flatMap(toEntries);
  }
  return [];
};

export default function Edit({ attributes, setAttributes }: EditProps) {
  const {
    variant,
    aspectRatio,
    labelOne,
    labelTwo,
    labelThree,
    description,
    accentColor,
    touchAutoplay,
    trigger,
  } = attributes;
  const blockProps = useBlockProps();
  const hostRef = useRef<HTMLDivElement>(null);
  const labels = [labelOne, labelTwo, labelThree];
  const labelsJson = JSON.stringify(labels);
  const [rawPalette] = useSettings("color.palette");
  const palette = toEntries(rawPalette);
  const accentValue = palette.find((entry) => entry.slug === accentColor)?.color;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }
    const handle = mountFeatureCanvas(host, {
      variant,
      labels: JSON.parse(labelsJson),
      accent: accentColor || "primary",
    });
    return () => handle.destroy();
  }, [variant, labelsJson, accentColor]);

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Canvas", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Variant", "kotlinskidev")}
            value={variant}
            options={VARIANT_OPTIONS.map((option) => ({ ...option }))}
            onChange={(value) => setAttributes({ variant: value as FeatureCanvasVariant })}
          />
          <TextControl
            label={__("Aspect ratio", "kotlinskidev")}
            help={__("CSS aspect-ratio value, e.g. 16/9.", "kotlinskidev")}
            value={aspectRatio}
            onChange={(value) => setAttributes({ aspectRatio: value })}
          />
          <TextControl
            label={__("Label one", "kotlinskidev")}
            value={labelOne}
            onChange={(value) => setAttributes({ labelOne: value })}
          />
          <TextControl
            label={__("Label two", "kotlinskidev")}
            value={labelTwo}
            onChange={(value) => setAttributes({ labelTwo: value })}
          />
          <TextControl
            label={__("Label three", "kotlinskidev")}
            value={labelThree}
            onChange={(value) => setAttributes({ labelThree: value })}
          />
          <TextareaControl
            label={__("Accessible description", "kotlinskidev")}
            help={__(
              "Describe what the illustration shows when it carries information the nearby text does not. Leave empty to hide it from assistive technology as decoration.",
              "kotlinskidev"
            )}
            value={description}
            onChange={(value) => setAttributes({ description: value })}
          />
        </PanelBody>
        <PanelBody title={__("Colour", "kotlinskidev")} initialOpen={false}>
          <ColorPalette
            colors={palette.map(({ name, color }) => ({ name, color }))}
            value={accentValue}
            disableCustomColors
            clearable
            onChange={(color) =>
              setAttributes({
                accentColor: palette.find((entry) => entry.color === color)?.slug ?? "",
              })
            }
          />
        </PanelBody>
        <PanelBody title={__("Animation", "kotlinskidev")} initialOpen={false}>
          <SelectControl
            label={__("Animate", "kotlinskidev")}
            value={trigger}
            options={[
              { label: __("On hover", "kotlinskidev"), value: "hover" },
              { label: __("When in view", "kotlinskidev"), value: "in-view" },
            ]}
            help={__(
              "When in view, the illustration plays as it scrolls into view and resets once it leaves.",
              "kotlinskidev"
            )}
            onChange={(value) => setAttributes({ trigger: value as FeatureCanvasTrigger })}
          />
          <ToggleControl
            label={__("Animate automatically on touch devices", "kotlinskidev")}
            help={__(
              "Touch screens have no hover, so the illustration animates while the card is in the middle of the viewport.",
              "kotlinskidev"
            )}
            checked={touchAutoplay}
            onChange={(value) => setAttributes({ touchAutoplay: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div
          ref={hostRef}
          className="kt-feature-canvas"
          style={{ aspectRatio }}
          data-variant={variant}
          data-labels={labelsJson}
          data-accent={accentColor || "primary"}
          data-trigger={trigger}
        >
          <canvas className="kt-feature-canvas__canvas" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
