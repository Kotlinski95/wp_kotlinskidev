import React from "react";
import { TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { buildProtectedContentClassName } from "./protected-content-types";
import type { ProtectedContentAttributes } from "./protected-content-types";

const HTML_TEXTAREA_ROWS = 6;

interface HtmlModeEditorProps {
  attributes: ProtectedContentAttributes;
  setAttributes: (attributes: Partial<ProtectedContentAttributes>) => void;
}

export const HtmlModeEditor = ({ attributes, setAttributes }: HtmlModeEditorProps) => {
  const { content } = attributes;

  return (
    <div className={buildProtectedContentClassName(attributes)}>
      <TextareaControl
        label={__("HTML Content", "kotlinskidev")}
        value={content}
        onChange={(value) => setAttributes({ content: value })}
        placeholder={__("Enter your HTML content here…", "kotlinskidev")}
        rows={HTML_TEXTAREA_ROWS}
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
  );
};
