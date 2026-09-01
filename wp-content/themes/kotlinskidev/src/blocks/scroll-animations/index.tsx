import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import React from "react";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

const scrollAnimations = [
  { label: __("No Animation", "kotlinskidev"), value: "" },
  { label: __("Fade In", "kotlinskidev"), value: "fade-in-on-scroll" },
  { label: __("Fade Up", "kotlinskidev"), value: "fade-up-on-scroll" },
  { label: __("Fade Left", "kotlinskidev"), value: "fade-left-on-scroll" },
  { label: __("Fade Right", "kotlinskidev"), value: "fade-right-on-scroll" },
  { label: __("Flip Up", "kotlinskidev"), value: "flip-up-on-scroll" },
  { label: __("Flip Down", "kotlinskidev"), value: "flip-down-on-scroll" },
  { label: __("Flip Left", "kotlinskidev"), value: "flip-left-on-scroll" },
  { label: __("Flip Right", "kotlinskidev"), value: "flip-right-on-scroll" },
];

const scrollAnimationDelays = [
  { label: __("No Delay", "kotlinskidev"), value: "" },
  { label: __("100ms", "kotlinskidev"), value: "delay-100" },
  { label: __("200ms", "kotlinskidev"), value: "delay-200" },
  { label: __("300ms", "kotlinskidev"), value: "delay-300" },
  { label: __("500ms", "kotlinskidev"), value: "delay-500" },
  { label: __("750ms", "kotlinskidev"), value: "delay-750" },
  { label: __("1000ms", "kotlinskidev"), value: "delay-1000" },
];

const scrollAnimationTranslates = [
  { label: __("Default Distance", "kotlinskidev"), value: "" },
  { label: __("Small (20px)", "kotlinskidev"), value: "translate-sm" },
  { label: __("Medium (40px)", "kotlinskidev"), value: "translate-md" },
  { label: __("Large (60px)", "kotlinskidev"), value: "translate-lg" },
  { label: __("Extra Large (80px)", "kotlinskidev"), value: "translate-xl" },
  { label: __("2X Large (100px)", "kotlinskidev"), value: "translate-2xl" },
];

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
            {scrollAnimation && !scrollAnimation.includes("flip") && (
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
