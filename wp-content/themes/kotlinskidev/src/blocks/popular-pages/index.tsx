import React from "react";
import { registerBlockType, type BlockEditProps, type BlockConfiguration } from "@wordpress/blocks";
import { InspectorControls, useBlockProps, useSettings } from "@wordpress/block-editor";
import { PanelBody, TextControl, RangeControl, FontSizePicker } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import navMetadata from "../nav-popular-pages/block.json";

export interface PopularPagesAttributes {
  title: string;
  count: number;
  titleFontSize?: string;
}

export function PopularPagesEdit({
  attributes,
  setAttributes,
}: BlockEditProps<PopularPagesAttributes>) {
  const blockProps = useBlockProps({ className: "kt-popular-pages" });
  const previewCount = Math.min(attributes.count, 5);
  const remainder = attributes.count - previewCount;
  const [fontSizes] = useSettings("typography.fontSizes");

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Popular Pages", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Title", "kotlinskidev")}
            value={attributes.title}
            onChange={(title) => setAttributes({ title })}
          />
          <RangeControl
            label={__("Number of pages", "kotlinskidev")}
            value={attributes.count}
            onChange={(count) => setAttributes({ count: count ?? 5 })}
            min={1}
            max={20}
          />
        </PanelBody>
        <PanelBody title={__("Title Typography", "kotlinskidev")}>
          <FontSizePicker
            fontSizes={fontSizes as never}
            value={attributes.titleFontSize}
            onChange={(titleFontSize) =>
              setAttributes({ titleFontSize: titleFontSize ?? undefined })
            }
          />
        </PanelBody>
      </InspectorControls>

      {attributes.title && (
        <p
          style={{
            fontSize: attributes.titleFontSize || "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(0,0,0,0.4)",
            margin: "0 0 0.5rem",
          }}
        >
          {attributes.title}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {Array.from({ length: previewCount }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.8125rem",
              padding: "0.25rem 0.625rem",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: "2rem",
              color: "rgba(0,0,0,0.45)",
            }}
          >
            {__("Page title", "kotlinskidev")}
          </span>
        ))}
        {remainder > 0 && (
          <span
            style={{
              fontSize: "0.8125rem",
              padding: "0.25rem 0.625rem",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            +{remainder} {__("more", "kotlinskidev")}
          </span>
        )}
      </div>
    </div>
  );
}

const definition = { edit: PopularPagesEdit, save: () => null };

registerBlockType(metadata as unknown as BlockConfiguration<PopularPagesAttributes>, definition);
registerBlockType(navMetadata as unknown as BlockConfiguration<PopularPagesAttributes>, definition);
