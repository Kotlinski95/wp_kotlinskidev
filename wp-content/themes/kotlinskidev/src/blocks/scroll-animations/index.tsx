import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import React from "react";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import {
  ANIMATION_TRANSLATE_OPTIONS,
  buildAnimationTypeOptions,
  supportsDistanceControl,
} from "@utils/animation-options";

const scrollAnimations = buildAnimationTypeOptions("scroll");

const scrollAnimationDelays = [
  { label: __("No Delay", "kotlinskidev"), value: "" },
  { label: __("100ms", "kotlinskidev"), value: "delay-100" },
  { label: __("200ms", "kotlinskidev"), value: "delay-200" },
  { label: __("300ms", "kotlinskidev"), value: "delay-300" },
  { label: __("500ms", "kotlinskidev"), value: "delay-500" },
  { label: __("750ms", "kotlinskidev"), value: "delay-750" },
  { label: __("1000ms", "kotlinskidev"), value: "delay-1000" },
];

const scrollAnimationTranslates = ANIMATION_TRANSLATE_OPTIONS;

function addScrollAnimationAttribute(settings: any) {
  const excludedBlocks = [
    "core/html",
    "core/code",
    "core/preformatted",
    "core/verse",
    ...DYNAMIC_PREVIEW_BLOCKS,
  ];

  if (excludedBlocks.includes(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      scrollAnimation: {
        type: "string",
        default: "",
      },
      scrollAnimationDelay: {
        type: "string",
        default: "",
      },
      scrollAnimationTranslate: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
}

const withScrollAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes, name } = props;
    const { scrollAnimation, scrollAnimationDelay, scrollAnimationTranslate } = attributes;

    const excludedBlocks = [
      "core/html",
      "core/code",
      "core/preformatted",
      "core/verse",
      ...DYNAMIC_PREVIEW_BLOCKS,
    ];

    if (excludedBlocks.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Scroll Animations", "kotlinskidev")} icon="art" initialOpen={false}>
            <SelectControl
              label={__("Animation Type", "kotlinskidev")}
              value={scrollAnimation || ""}
              options={scrollAnimations}
              onChange={(value: string) => setAttributes({ scrollAnimation: value })}
              help={__(
                "Choose an animation that will trigger when the block comes into view.",
                "kotlinskidev"
              )}
            />
            <SelectControl
              label={__("Animation Delay", "kotlinskidev")}
              value={scrollAnimationDelay || ""}
              options={scrollAnimationDelays}
              onChange={(value: string) => setAttributes({ scrollAnimationDelay: value })}
              help={__("Set a delay before the animation starts.", "kotlinskidev")}
            />
            {supportsDistanceControl(scrollAnimation || "") && (
              <SelectControl
                label={__("Animation Distance", "kotlinskidev")}
                value={scrollAnimationTranslate || ""}
                options={scrollAnimationTranslates}
                onChange={(value: string) => setAttributes({ scrollAnimationTranslate: value })}
                help={__(
                  "Control how far elements move during fade/slide animations.",
                  "kotlinskidev"
                )}
              />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withScrollAnimationControls");

function applyScrollAnimationClass(extraProps: any, blockType: any, attributes: any) {
  const { scrollAnimation, scrollAnimationDelay, scrollAnimationTranslate } = attributes;

  const classes = [];

  if (scrollAnimation) {
    classes.push(scrollAnimation);
  }

  if (scrollAnimationDelay) {
    classes.push(scrollAnimationDelay);
  }

  if (scrollAnimationTranslate) {
    classes.push(scrollAnimationTranslate);
  }

  if (classes.length > 0) {
    const classString = classes.join(" ");
    extraProps.className = extraProps.className
      ? `${extraProps.className} ${classString}`
      : classString;
  }

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/scroll-animation-attribute",
  addScrollAnimationAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/scroll-animation-controls",
  withScrollAnimationControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/scroll-animation-class",
  applyScrollAnimationClass
);
