import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const CLIP_TO_RADIUS_BLOCKS = ["core/group"];

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsClipToRadius = (name?: string): boolean =>
  Boolean(name && CLIP_TO_RADIUS_BLOCKS.includes(name));

const addClipToRadiusAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsClipToRadius(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevClipToRadius: { type: "boolean", default: false },
    },
  };
};

interface ClipToRadiusAttributes {
  kotlinskidevClipToRadius?: boolean;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & ClipToRadiusAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withClipToRadiusControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsClipToRadius(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const clipToRadius = Boolean(attributes.kotlinskidevClipToRadius);

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Corner Clipping", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Clip content to this block's border radius", "kotlinskidev")}
              checked={clipToRadius}
              onChange={(next) => setAttributes({ kotlinskidevClipToRadius: next })}
              help={__(
                "Set a border radius in this block's own Border panel above, then turn this on. Any child's own background (e.g. a hover background color) gets masked to the rounded corners automatically — whichever child ends up in a corner at any breakpoint, without tracking which one that is.",
                "kotlinskidev"
              )}
              __nextHasNoMarginBottom
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withClipToRadiusControls");

interface SaveContentExtraProps {
  className?: string;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

function applyClipToRadiusProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: ClipToRadiusAttributes
): SaveContentExtraProps {
  if (!supportsClipToRadius(blockType.name) || !attributes.kotlinskidevClipToRadius) {
    return extraProps;
  }

  extraProps.className = extraProps.className
    ? `${extraProps.className} has-clipped-corners`
    : "has-clipped-corners";

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/clip-to-radius-attributes",
  addClipToRadiusAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/clip-to-radius-controls", withClipToRadiusControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/clip-to-radius-props",
  applyClipToRadiusProps
);
