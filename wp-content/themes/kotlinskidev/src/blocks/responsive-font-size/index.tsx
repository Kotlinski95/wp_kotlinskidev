import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { hasBlockSupport } from "@wordpress/blocks";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import type { BlockEditProps, BlockSettings } from "@utils/block-filter-types";
import { ResponsiveFontSizeInlineControl } from "./inline-control";
import type { ResponsiveFontSizeAttributes } from "./font-size-types";

const addResponsiveFontSizeAttribute = (settings: BlockSettings): BlockSettings => {
  if (!settings.supports?.typography || DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveFontSize: {
        type: "object",
        default: {},
      },
    },
  };
};

const withResponsiveFontSizeControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ResponsiveFontSizeAttributes>) => {
    const { attributes, setAttributes, name } = props;

    if (!hasBlockSupport(name, "typography") || DYNAMIC_PREVIEW_BLOCKS.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="typography">
          <ResponsiveFontSizeInlineControl attributes={attributes} setAttributes={setAttributes} />
        </InspectorControls>
      </Fragment>
    );
  };
}, "withResponsiveFontSizeControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-font-size-attributes",
  addResponsiveFontSizeAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-font-size-controls",
  withResponsiveFontSizeControls
);
