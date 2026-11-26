import React from "react";
import type { BlockEditProps } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
  TextColorPanel,
  buildGradientTextStyle,
  placeholderStyle,
  previewStyle,
} from "./editor-controls";
import type { NavParagraphAttributes } from "./types";

export function NavParagraphEdit({
  attributes,
  setAttributes,
}: BlockEditProps<NavParagraphAttributes>) {
  const blockProps = useBlockProps();
  const { content, textColor, textGradient } = attributes;
  const textStyle = buildGradientTextStyle(textGradient, textColor);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Content", "kotlinskidev")} initialOpen>
          <TextareaControl
            label={__("Paragraph text", "kotlinskidev")}
            value={content}
            onChange={(value) => setAttributes({ content: value })}
            rows={5}
          />
        </PanelBody>
        <TextColorPanel
          controlLabel={__("Text", "kotlinskidev")}
          textColor={textColor}
          textGradient={textGradient}
          setAttributes={setAttributes}
        />
      </InspectorControls>
      <div style={previewStyle}>
        {content ? (
          <p style={{ margin: 0, ...textStyle }}>{content}</p>
        ) : (
          <p style={placeholderStyle}>
            {__("Nav paragraph — add text in the panel →", "kotlinskidev")}
          </p>
        )}
      </div>
    </div>
  );
}
