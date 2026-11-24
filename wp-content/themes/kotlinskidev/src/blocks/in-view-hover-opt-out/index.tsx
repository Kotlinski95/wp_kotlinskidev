import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { appendClassName } from "@utils/block-filter-types";
import type { BlockEditProps, BlockSettings, ExtraProps } from "@utils/block-filter-types";

const OPT_OUT_BLOCKS = ["core/group", "core/columns", "core/column", "core/cover"];
const OPT_OUT_CLASS = "kt-in-view-hover-off";

interface InViewHoverOptOutAttributes {
  kotlinskidevInViewHoverOptOut?: boolean;
}

const supportsOptOut = (name?: string): boolean => Boolean(name && OPT_OUT_BLOCKS.includes(name));

const addOptOutAttribute = (settings: BlockSettings): BlockSettings => {
  if (!supportsOptOut(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevInViewHoverOptOut: { type: "boolean", default: false },
    },
  };
};

const OptOutPanel = ({
  attributes,
  setAttributes,
}: Pick<BlockEditProps<InViewHoverOptOutAttributes>, "attributes" | "setAttributes">) => (
  <PanelBody title={__("Touch-screen centred hover", "kotlinskidev")} initialOpen={false}>
    <ToggleControl
      label={__("Exclude inner blocks from touch-screen centred hover", "kotlinskidev")}
      checked={Boolean(attributes.kotlinskidevInViewHoverOptOut)}
      onChange={(next) => setAttributes({ kotlinskidevInViewHoverOptOut: next })}
      help={__(
        "Hover effects inside this block stay hover-only and do not play when centred on touch screens.",
        "kotlinskidev"
      )}
      __nextHasNoMarginBottom
    />
  </PanelBody>
);

const withOptOutControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<InViewHoverOptOutAttributes>) => {
    if (!supportsOptOut(props.name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <OptOutPanel attributes={props.attributes} setAttributes={props.setAttributes} />
        </InspectorControls>
      </Fragment>
    );
  };
}, "withInViewHoverOptOutControls");

const applyOptOutClass = (
  extraProps: ExtraProps,
  blockType: { name?: string },
  attributes: InViewHoverOptOutAttributes
): ExtraProps => {
  if (supportsOptOut(blockType.name) && attributes.kotlinskidevInViewHoverOptOut) {
    appendClassName(extraProps, OPT_OUT_CLASS);
  }

  return extraProps;
};

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/in-view-hover-opt-out-attribute",
  addOptOutAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/in-view-hover-opt-out-controls", withOptOutControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/in-view-hover-opt-out-class",
  applyOptOutClass
);
