import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { RichText, useBlockProps } from "@wordpress/block-editor";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { HtmlModeEditor } from "./html-mode-editor";
import { ProtectionSettingsPanel } from "./protection-settings-panel";
import { buildProtectedContentClassName } from "./protected-content-types";
import type { ProtectedContentAttributes } from "./protected-content-types";
import "./style.scss";

export type { ProtectedContentAttributes };

const ALLOWED_FORMATS = [
  "core/bold",
  "core/italic",
  "core/link",
  "core/strikethrough",
  "core/underline",
  "kotlinskidev/highlight-gradient",
  "kotlinskidev/gradient-text",
];

interface EditProps {
  attributes: ProtectedContentAttributes;
  setAttributes: (attributes: Partial<ProtectedContentAttributes>) => void;
}

export const Edit = ({ attributes, setAttributes }: EditProps) => {
  const { content, useProtection, protectionType, tagName, isHtmlMode } = attributes;

  const blockProps = useBlockProps();

  return (
    <Fragment>
      <ProtectionSettingsPanel attributes={attributes} setAttributes={setAttributes} />

      {useProtection && (
        <div className="protection-indicator">
          🛡️ {__("Protected Content", "kotlinskidev")} ({protectionType})
        </div>
      )}

      {isHtmlMode ? (
        <HtmlModeEditor attributes={attributes} setAttributes={setAttributes} />
      ) : (
        <RichText
          {...blockProps}
          tagName={tagName as keyof HTMLElementTagNameMap}
          className={buildProtectedContentClassName(attributes)}
          value={content}
          onChange={(value) => setAttributes({ content: value })}
          placeholder={__("Enter your content here…", "kotlinskidev")}
          allowedFormats={ALLOWED_FORMATS}
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
