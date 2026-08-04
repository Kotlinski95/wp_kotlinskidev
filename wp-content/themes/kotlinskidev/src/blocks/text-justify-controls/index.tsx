import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const SUPPORTED_BLOCKS = ["core/paragraph", "core/heading"];

const JustifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
  </svg>
);

interface TypographyStyle {
  textAlign?: string;
  [key: string]: unknown;
}

interface BlockStyle {
  typography?: TypographyStyle;
  [key: string]: unknown;
}

interface TextAlignAttributes {
  style?: BlockStyle;
}

interface BlockEditProps {
  name: string;
  attributes: TextAlignAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withTextJustifyControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!SUPPORTED_BLOCKS.includes(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const currentTextAlign = attributes.style?.typography?.textAlign;
    const isJustified = currentTextAlign === "justify";

    const toggleJustify = () => {
      setAttributes({
        style: {
          ...attributes.style,
          typography: {
            ...attributes.style?.typography,
            textAlign: isJustified ? undefined : "justify",
          },
        },
      });
    };

    return (
      <Fragment>
        <BlockControls group="block">
          <ToolbarGroup>
            <ToolbarButton
              icon={<JustifyIcon />}
              label={__("Justify text", "kotlinskidev")}
              isActive={isJustified}
              onClick={toggleJustify}
            />
          </ToolbarGroup>
        </BlockControls>
        <BlockEdit {...props} />
      </Fragment>
    );
  };
}, "withTextJustifyControl");

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/text-justify-controls",
  withTextJustifyControl
);
