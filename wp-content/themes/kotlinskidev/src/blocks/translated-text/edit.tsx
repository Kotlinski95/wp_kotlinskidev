import React from "react";
import { InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export type TranslatedTextTagName = "p" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "a";

export interface TranslatedTextAttributes {
  tagName: TranslatedTextTagName;
  stringName: string;
  fallbackText: string;
  href: string;
}

interface EditProps {
  attributes: TranslatedTextAttributes;
  setAttributes: (attrs: Partial<TranslatedTextAttributes>) => void;
}

const TAG_NAME_OPTIONS: { label: string; value: TranslatedTextTagName }[] = [
  { label: __("Paragraph", "kotlinskidev"), value: "p" },
  { label: __("Heading 2", "kotlinskidev"), value: "h2" },
  { label: __("Heading 3", "kotlinskidev"), value: "h3" },
  { label: __("Heading 4", "kotlinskidev"), value: "h4" },
  { label: __("Heading 5", "kotlinskidev"), value: "h5" },
  { label: __("Heading 6", "kotlinskidev"), value: "h6" },
  { label: __("Inline text", "kotlinskidev"), value: "span" },
  { label: __("Link", "kotlinskidev"), value: "a" },
];

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { tagName, stringName, fallbackText, href } = attributes;

  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Translation", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Tag", "kotlinskidev")}
            value={tagName}
            options={TAG_NAME_OPTIONS}
            onChange={(value) => setAttributes({ tagName: value as TranslatedTextTagName })}
          />
          <TextControl
            label={__("String name", "kotlinskidev")}
            help={__(
              "Unique key used in Languages → Strings translations, e.g. service-location-hero-heading. Leave empty to skip translation.",
              "kotlinskidev"
            )}
            value={stringName}
            onChange={(value) => setAttributes({ stringName: value })}
          />
          {"a" === tagName && (
            <TextControl
              label={__("Link URL", "kotlinskidev")}
              help={__(
                "Translated the same way as the text, under {stringName}-href.",
                "kotlinskidev"
              )}
              value={href}
              onChange={(value) => setAttributes({ href: value })}
            />
          )}
        </PanelBody>
      </InspectorControls>

      <RichText
        {...blockProps}
        tagName={tagName}
        value={fallbackText}
        onChange={(value) => setAttributes({ fallbackText: value })}
        placeholder={__("Enter the base text…", "kotlinskidev")}
        allowedFormats={[]}
      />
    </>
  );
}
