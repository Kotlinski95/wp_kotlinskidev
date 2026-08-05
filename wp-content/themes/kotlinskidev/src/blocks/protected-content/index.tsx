import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl, TextareaControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import "./style.scss";

type ProtectionType = "email" | "phone" | "address" | "other" | "text";

interface Attributes {
  content: string;
  useProtection: boolean;
  protectionType: ProtectionType;
  tagName: string;
  isHtmlMode: boolean;
}

interface EditProps {
  attributes: Attributes;
  setAttributes: (attributes: Partial<Attributes>) => void;
}

const Edit = ({ attributes, setAttributes }: EditProps) => {
  const { content, useProtection, protectionType, tagName, isHtmlMode } = attributes;

  const blockProps = useBlockProps();

  const tagNameOptions = [
    { label: __("Paragraph", "kotlinskidev"), value: "p" },
    { label: __("Heading 1", "kotlinskidev"), value: "h1" },
    { label: __("Heading 2", "kotlinskidev"), value: "h2" },
    { label: __("Heading 3", "kotlinskidev"), value: "h3" },
    { label: __("Heading 4", "kotlinskidev"), value: "h4" },
    { label: __("Heading 5", "kotlinskidev"), value: "h5" },
    { label: __("Heading 6", "kotlinskidev"), value: "h6" },
    { label: __("Span", "kotlinskidev"), value: "span" },
    { label: __("Div", "kotlinskidev"), value: "div" },
  ];

  const protectionTypeOptions = [
    { label: __("Email", "kotlinskidev"), value: "email" },
    { label: __("Phone", "kotlinskidev"), value: "phone" },
    { label: __("Address", "kotlinskidev"), value: "address" },
    { label: __("Other", "kotlinskidev"), value: "other" },
    { label: __("General Text (preserves HTML)", "kotlinskidev"), value: "text" },
  ];

  return (
    <Fragment>
      <InspectorControls>
        <PanelBody title={__("Protection Settings", "kotlinskidev")} initialOpen={true}>
          <ToggleControl
            label={__("Use Protection", "kotlinskidev")}
            help={__(
              "Encrypt this content server-side; only revealed after a click.",
              "kotlinskidev"
            )}
            checked={useProtection}
            onChange={(value) => setAttributes({ useProtection: value })}
          />

          {useProtection && (
            <SelectControl
              label={__("Protection Type", "kotlinskidev")}
              value={protectionType}
              options={protectionTypeOptions}
              onChange={(value) => setAttributes({ protectionType: value as ProtectionType })}
            />
          )}

          <ToggleControl
            label={__("HTML Mode", "kotlinskidev")}
            help={__("Enable to preserve HTML structure (links, formatting, etc.)", "kotlinskidev")}
            checked={isHtmlMode}
            onChange={(value) => setAttributes({ isHtmlMode: value })}
          />

          <SelectControl
            label={__("HTML Tag", "kotlinskidev")}
            value={tagName}
            options={tagNameOptions}
            onChange={(value) => setAttributes({ tagName: value })}
          />
        </PanelBody>
      </InspectorControls>

      {useProtection && (
        <div className="protection-indicator">
          🛡️ {__("Protected Content", "kotlinskidev")} ({protectionType})
        </div>
      )}

      {isHtmlMode ? (
        <div
          className={
            useProtection
              ? `protected-content protected-content--${protectionType}`
              : "protected-content"
          }
        >
          <TextareaControl
            label={__("HTML Content", "kotlinskidev")}
            value={content}
            onChange={(value) => setAttributes({ content: value })}
            placeholder={__("Enter your HTML content here…", "kotlinskidev")}
            rows={6}
            help={__(
              "You can paste rich HTML content including links, formatting, and attributes.",
              "kotlinskidev"
            )}
          />

          {content && (
            <div
              className="html-preview"
              style={{
                border: "0.0625rem solid #ddd",
                padding: "0.75rem",
                marginTop: "0.5rem",
                backgroundColor: "#f9f9f9",
                borderRadius: "0.25rem",
              }}
            >
              <strong>{__("Preview:", "kotlinskidev")}</strong>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </div>
      ) : (
        <RichText
          {...blockProps}
          tagName={tagName as any}
          className={
            useProtection
              ? `protected-content protected-content--${protectionType}`
              : "protected-content"
          }
          value={content}
          onChange={(value) => setAttributes({ content: value })}
          placeholder={__("Enter your content here…", "kotlinskidev")}
          allowedFormats={[
            "core/bold",
            "core/italic",
            "core/link",
            "core/strikethrough",
            "core/underline",
            "kotlinskidev/highlight-gradient",
            "kotlinskidev/gradient-text",
          ]}
          multiline={false}
          preserveWhiteSpace={true}
        />
      )}
    </Fragment>
  );
};

registerBlockType("kotlinskidev/protected-content", {
  title: __("Protected Content", "kotlinskidev"),
  description: __("Content that can be protected from bots using obfuscation", "kotlinskidev"),
  category: "kotlinskidev",
  icon: "shield",
  supports: {
    html: false,
    anchor: true,
    className: true,
    color: {
      text: true,
      background: true,
      link: true,
    },
    spacing: {
      margin: true,
      padding: true,
      blockGap: true,
    },
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
    },
    border: {
      color: true,
      radius: true,
      style: true,
      width: true,
    },
  },
  attributes: {
    content: {
      type: "string",
      default: "",
    },
    useProtection: {
      type: "boolean",
      default: false,
    },
    protectionType: {
      type: "string",
      default: "email",
    },
    tagName: {
      type: "string",
      default: "p",
    },
    isHtmlMode: {
      type: "boolean",
      default: false,
    },
  },

  edit: Edit,

  save: () => null,
});
