import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
  RangeControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";
import "./style.scss";

export interface ScrollToTopAttributes {
  variant: "fixed" | "bar";
  showArrow: boolean;
  arrowIconId: number;
  arrowIconUrl: string;
  arrowSize: number;
}

const DEFAULT_ARROW_SIZE = 16;

interface EditProps {
  attributes: ScrollToTopAttributes;
  setAttributes: (attrs: Partial<ScrollToTopAttributes>) => void;
}

const VARIANT_OPTIONS = [
  { label: __("Fixed Arrow — floating button", "kotlinskidev"), value: "fixed" },
  { label: __("Full-Width Bar — inline", "kotlinskidev"), value: "bar" },
];

const VARIANT_HINTS: Record<ScrollToTopAttributes["variant"], string> = {
  fixed: __("Fixed button, visible on the frontend while scrolling", "kotlinskidev"),
  bar: __("Full-width bar, always visible where placed — e.g. above the footer", "kotlinskidev"),
};

export function Edit({ attributes, setAttributes }: EditProps) {
  const { variant, showArrow, arrowIconId, arrowIconUrl, arrowSize } = attributes;
  const blockProps = useBlockProps({ className: "kt-editor-placeholder" });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Scroll To Top Settings", "kotlinskidev")}>
          <SelectControl
            label={__("Variant", "kotlinskidev")}
            value={variant}
            options={VARIANT_OPTIONS}
            onChange={(value) =>
              setAttributes({ variant: value as ScrollToTopAttributes["variant"] })
            }
          />
          <TextControl
            label={__("Button Label", "kotlinskidev")}
            value={__("Scroll to Top", "kotlinskidev")}
            disabled
            help={__(
              'Managed via Polylang → Languages → Translations, string "Scroll To Top Button Label".',
              "kotlinskidev"
            )}
            onChange={() => {}}
          />
        </PanelBody>
        <PanelBody title={__("Arrow Icon", "kotlinskidev")} initialOpen={false}>
          {variant === "bar" ? (
            <>
              <ToggleControl
                label={__("Show arrow after label", "kotlinskidev")}
                checked={!!showArrow}
                onChange={(value) => setAttributes({ showArrow: value })}
              />
              {showArrow && (
                <>
                  <NavIconPicker
                    iconId={arrowIconId ?? 0}
                    iconUrl={arrowIconUrl ?? ""}
                    onChange={(id, url) => setAttributes({ arrowIconId: id, arrowIconUrl: url })}
                  />
                  <RangeControl
                    label={__("Arrow size", "kotlinskidev")}
                    value={arrowSize ?? DEFAULT_ARROW_SIZE}
                    min={8}
                    max={48}
                    onChange={(value) => setAttributes({ arrowSize: value ?? DEFAULT_ARROW_SIZE })}
                  />
                </>
              )}
            </>
          ) : (
            <p className="components-base-control__help">
              {__(
                "The arrow only applies to the Full-Width Bar variant — the Fixed Arrow variant already hides its label and shows only its own icon.",
                "kotlinskidev"
              )}
            </p>
          )}
        </PanelBody>
      </InspectorControls>
      <span className="kt-editor-placeholder__icon" aria-hidden="true">
        ↑
      </span>
      <span className="kt-editor-placeholder__label">{__("Scroll To Top", "kotlinskidev")}</span>
      <span className="kt-editor-placeholder__hint">{VARIANT_HINTS[variant]}</span>
    </div>
  );
}

registerBlockType("kotlinskidev/scroll-to-top", {
  title: "Scroll To Top",
  category: "kotlinskidev",
  attributes: {
    variant: { type: "string", default: "fixed" },
    showArrow: { type: "boolean", default: false },
    arrowIconId: { type: "number", default: 0 },
    arrowIconUrl: { type: "string", default: "" },
    arrowSize: { type: "number", default: DEFAULT_ARROW_SIZE },
  },
  edit: Edit,
  save() {
    return null;
  },
});
