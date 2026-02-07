import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import React from "react";

const hoverAnimations = [
  { label: __("No Animation", "kotlinskidev"), value: "" },
  { label: __("Jump", "kotlinskidev"), value: "hover-jump" },
  { label: __("Jump Subtle", "kotlinskidev"), value: "hover-jump-subtle" },
  { label: __("Jump Smooth", "kotlinskidev"), value: "hover-jump-smooth" },
  { label: __("Jump Strong", "kotlinskidev"), value: "hover-jump-strong" },
  { label: __("Jump with Shadow", "kotlinskidev"), value: "hover-jump-shadow" },
  { label: __("Scale", "kotlinskidev"), value: "hover-scale" },
  { label: __("Fade", "kotlinskidev"), value: "hover-fade" },
  { label: __("Rotate", "kotlinskidev"), value: "hover-rotate" },
  { label: __("Bounce", "kotlinskidev"), value: "hover-bounce" },
  { label: __("Constant Bounce", "kotlinskidev"), value: "constant-bounce" },
  { label: __("Constant Bounce Subtle", "kotlinskidev"), value: "constant-bounce-subtle" },
  { label: __("Constant Bounce Strong", "kotlinskidev"), value: "constant-bounce-strong" },
  { label: __("Constant Bounce Fast", "kotlinskidev"), value: "constant-bounce-fast" },
];

function addHoverAnimationAttribute(settings: any) {
  const excludedBlocks = ["core/html", "core/code", "core/preformatted", "core/verse"];

  if (excludedBlocks.includes(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      hoverAnimation: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
}

const withHoverAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes, name } = props;
    const { hoverAnimation } = attributes;

    const excludedBlocks = ["core/html", "core/code", "core/preformatted", "core/verse"];

    if (excludedBlocks.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Hover Animations", "kotlinskidev")} icon="art" initialOpen={false}>
            <SelectControl
              label={__("Animation Type", "kotlinskidev")}
              value={hoverAnimation || ""}
              options={hoverAnimations}
              onChange={(value: string) => setAttributes({ hoverAnimation: value })}
              help={__(
                "Choose an animation that will trigger when hovering over the block.",
                "kotlinskidev"
              )}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withHoverAnimationControls");

function applyHoverAnimationClass(extraProps: any, blockType: any, attributes: any) {
  const { hoverAnimation } = attributes;

  if (hoverAnimation) {
    extraProps.className = extraProps.className
      ? `${extraProps.className} ${hoverAnimation}`
      : hoverAnimation;
  }

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/hover-animation-attribute",
  addHoverAnimationAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/hover-animation-controls", withHoverAnimationControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/hover-animation-class",
  applyHoverAnimationClass
);
