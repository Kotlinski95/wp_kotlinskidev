import React, { type ComponentType } from "react";
import * as blockEditor from "@wordpress/block-editor";
import { InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, TextControl } from "@wordpress/components";
import { useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { registerBlockStyle, unregisterBlockStyle } from "@wordpress/blocks";
import { select as dataSelect } from "@wordpress/data";

export type TranslatedTextTagName = "p" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "a";

export interface TranslatedTextAttributes {
  tagName: TranslatedTextTagName;
  stringName: string;
  fallbackText: string;
  href: string;
  linkedPostId: number;
}

interface LinkControlValue {
  url?: string;
  id?: number;
  kind?: string;
}

interface LinkControlProps {
  value: LinkControlValue;
  settings: { id: string; title: string }[];
  onChange: (value: LinkControlValue) => void;
  onRemove: () => void;
}

const { __experimentalLinkControl: LinkControl } = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
};

interface EditProps {
  attributes: TranslatedTextAttributes;
  setAttributes: (attrs: Partial<TranslatedTextAttributes>) => void;
  isSelected: boolean;
}

const BLOCK_NAME = "kotlinskidev/translated-text";

interface CachedButtonStyle {
  name: string;
  label: string;
}

interface BlocksStoreSelectors {
  getBlockStyles: (name: string) => CachedButtonStyle[] | undefined;
}

const getRegisteredBlockStyles = (): CachedButtonStyle[] =>
  (dataSelect("core/blocks") as BlocksStoreSelectors).getBlockStyles(BLOCK_NAME) || [];

let cachedButtonStyles: CachedButtonStyle[] | null = null;

const getCachedButtonStyles = (): CachedButtonStyle[] => {
  if (null === cachedButtonStyles) {
    cachedButtonStyles = getRegisteredBlockStyles().map(({ name, label }) => ({ name, label }));
  }
  return cachedButtonStyles;
};

const useButtonStylesOnlyForLinkTag = (tagName: TranslatedTextTagName, isSelected: boolean) => {
  useEffect(() => {
    if (!isSelected) {
      return undefined;
    }

    const buttonStyles = getCachedButtonStyles();

    if ("a" === tagName) {
      const registeredNames = new Set(getRegisteredBlockStyles().map(({ name }) => name));
      buttonStyles.forEach((style) => {
        if (!registeredNames.has(style.name)) {
          registerBlockStyle(BLOCK_NAME, style);
        }
      });
      return undefined;
    }

    buttonStyles.forEach((style) => unregisterBlockStyle(BLOCK_NAME, style.name));

    return () => {
      buttonStyles.forEach((style) => registerBlockStyle(BLOCK_NAME, style));
    };
  }, [tagName, isSelected]);
};

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

export default function Edit({ attributes, setAttributes, isSelected }: EditProps) {
  const { tagName, stringName, fallbackText, href, linkedPostId } = attributes;

  useButtonStylesOnlyForLinkTag(tagName, isSelected);

  const blockProps = useBlockProps(
    "a" === tagName ? { className: "wp-block-button__link wp-element-button" } : {}
  );

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
        </PanelBody>
        {"a" === tagName && (
          <PanelBody title={__("Link", "kotlinskidev")} initialOpen>
            <LinkControl
              value={{ url: href, id: linkedPostId || undefined }}
              settings={[]}
              onChange={(next) => {
                const isPostLink = "post-type" === next.kind && undefined !== next.id;
                setAttributes({
                  href: next.url ?? "",
                  linkedPostId: isPostLink ? Number(next.id) : 0,
                });
              }}
              onRemove={() => setAttributes({ href: "", linkedPostId: 0 })}
            />
            <p className="components-base-control__help">
              {linkedPostId > 0
                ? __(
                    "Linked to a page — automatically points to the matching translation for each visitor's language.",
                    "kotlinskidev"
                  )
                : __(
                    "Typed-in URL — translated the same way as the text, under {stringName}-href. Search above instead to link to an actual page and skip manual translation.",
                    "kotlinskidev"
                  )}
            </p>
          </PanelBody>
        )}
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
