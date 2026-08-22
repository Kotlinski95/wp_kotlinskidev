import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  CheckboxControl,
  ToggleControl,
  RangeControl,
} from "@wordpress/components";
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
  { label: __("Zoom", "kotlinskidev"), value: "hover-zoom-bg" },
  { label: __("Fade", "kotlinskidev"), value: "hover-fade" },
  { label: __("Rotate", "kotlinskidev"), value: "hover-rotate" },
  { label: __("Bounce", "kotlinskidev"), value: "hover-bounce" },
  { label: __("Constant Bounce", "kotlinskidev"), value: "constant-bounce" },
  { label: __("Constant Bounce Subtle", "kotlinskidev"), value: "constant-bounce-subtle" },
  { label: __("Constant Bounce Strong", "kotlinskidev"), value: "constant-bounce-strong" },
  { label: __("Constant Bounce Fast", "kotlinskidev"), value: "constant-bounce-fast" },
];

const combinableTransformEffects = [
  { label: __("Jump", "kotlinskidev"), value: "hover-jump" },
  { label: __("Jump Subtle", "kotlinskidev"), value: "hover-jump-subtle" },
  { label: __("Jump Smooth", "kotlinskidev"), value: "hover-jump-smooth" },
  { label: __("Jump Strong", "kotlinskidev"), value: "hover-jump-strong" },
  { label: __("Jump with Shadow", "kotlinskidev"), value: "hover-jump-shadow" },
  { label: __("Scale", "kotlinskidev"), value: "hover-scale" },
  { label: __("Rotate", "kotlinskidev"), value: "hover-rotate" },
  { label: __("Bounce", "kotlinskidev"), value: "hover-bounce" },
];

const DEFAULT_OPACITY_FROM = 100;
const DEFAULT_OPACITY_TO = 50;

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
      hoverAnimationExtra: {
        type: "array",
        default: [],
        items: { type: "string" },
      },
      hoverBackgroundColor: {
        type: "string",
        default: "",
      },
      hoverTextColor: {
        type: "string",
        default: "",
      },
      hoverOpacityEnabled: {
        type: "boolean",
        default: false,
      },
      hoverOpacityFrom: {
        type: "number",
        default: DEFAULT_OPACITY_FROM,
      },
      hoverOpacityTo: {
        type: "number",
        default: DEFAULT_OPACITY_TO,
      },
    };
  }

  return settings;
}

const withHoverAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes, name } = props;
    const {
      hoverAnimation,
      hoverAnimationExtra,
      hoverBackgroundColor,
      hoverTextColor,
      hoverOpacityEnabled,
      hoverOpacityFrom,
      hoverOpacityTo,
    } = attributes;
    const extraEffects: string[] = Array.isArray(hoverAnimationExtra) ? hoverAnimationExtra : [];

    const toggleExtraEffect = (value: string, checked: boolean) => {
      setAttributes({
        hoverAnimationExtra: checked
          ? [...extraEffects, value]
          : extraEffects.filter((effect) => effect !== value),
      });
    };

    const excludedBlocks = ["core/html", "core/code", "core/preformatted", "core/verse"];

    const pendingBgColorRef = React.useRef<string | null>(null);
    const handleBackgroundColorChange = (value: string | undefined) => {
      if (value !== undefined) {
        pendingBgColorRef.current = value;
        setAttributes({ hoverBackgroundColor: value });
      } else if (pendingBgColorRef.current !== null) {
        pendingBgColorRef.current = null;
      } else {
        setAttributes({ hoverBackgroundColor: "" });
      }
    };
    const isBgGradient = (hoverBackgroundColor || "").includes("gradient");

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
            {hoverAnimation === "hover-zoom-bg" && (
              <p className="components-base-control__help">
                {__(
                  "Zooms only the block's own image/video on hover, keeping surrounding content still. Works on Image, Video, Gallery, Media & Text, and Cover blocks. Set a border radius in this block's own Border panel to keep rounded corners while zooming.",
                  "kotlinskidev"
                )}
              </p>
            )}
            <p className="components-base-control__help">
              {__(
                "Combine additional movement effects with the animation above — they'll play together on hover.",
                "kotlinskidev"
              )}
            </p>
            {combinableTransformEffects
              .filter((effect) => effect.value !== hoverAnimation)
              .map((effect) => (
                <CheckboxControl
                  key={effect.value}
                  label={effect.label}
                  checked={extraEffects.includes(effect.value)}
                  onChange={(checked) => toggleExtraEffect(effect.value, checked)}
                />
              ))}
            <ToggleControl
              label={__("Fade opacity on hover", "kotlinskidev")}
              checked={Boolean(hoverOpacityEnabled)}
              onChange={(checked) => setAttributes({ hoverOpacityEnabled: checked })}
            />
            {hoverOpacityEnabled && (
              <>
                <RangeControl
                  label={__("Starting opacity", "kotlinskidev")}
                  value={hoverOpacityFrom ?? DEFAULT_OPACITY_FROM}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    setAttributes({ hoverOpacityFrom: value ?? DEFAULT_OPACITY_FROM })
                  }
                />
                <RangeControl
                  label={__("Opacity on hover", "kotlinskidev")}
                  value={hoverOpacityTo ?? DEFAULT_OPACITY_TO}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    setAttributes({ hoverOpacityTo: value ?? DEFAULT_OPACITY_TO })
                  }
                />
              </>
            )}
            <ColorGradientControl
              label={__("Hover background color", "kotlinskidev")}
              colorValue={hoverBackgroundColor && !isBgGradient ? hoverBackgroundColor : undefined}
              gradientValue={isBgGradient ? hoverBackgroundColor : undefined}
              onColorChange={handleBackgroundColorChange}
              onGradientChange={handleBackgroundColorChange}
              enableAlpha={true}
              clearable={true}
              __experimentalIsRenderedInSidebar={true}
              __nextHasNoMarginBottom
            />
            <ColorGradientControl
              label={__("Hover text color", "kotlinskidev")}
              colorValue={hoverTextColor || undefined}
              onColorChange={(value: string | undefined) =>
                setAttributes({ hoverTextColor: value || "" })
              }
              enableAlpha={true}
              clearable={true}
              __experimentalIsRenderedInSidebar={true}
              __nextHasNoMarginBottom
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withHoverAnimationControls");

function applyHoverAnimationClass(extraProps: any, blockType: any, attributes: any) {
  const {
    hoverAnimation,
    hoverAnimationExtra,
    hoverBackgroundColor,
    hoverTextColor,
    hoverOpacityEnabled,
    hoverOpacityFrom,
    hoverOpacityTo,
  } = attributes;

  const extraEffects = Array.isArray(hoverAnimationExtra) ? hoverAnimationExtra : [];
  const classes = [
    ...new Set([extraProps.className, hoverAnimation, ...extraEffects].filter(Boolean)),
  ];

  if (hoverBackgroundColor || hoverTextColor) {
    classes.push("has-hover-color-transition");
    extraProps.style = {
      ...extraProps.style,
      ...(hoverBackgroundColor && { "--hover-bg-color": hoverBackgroundColor }),
      ...(hoverTextColor && { "--hover-text-color": hoverTextColor }),
    };
  }

  if (hoverOpacityEnabled) {
    classes.push("has-hover-opacity");
    extraProps.style = {
      ...extraProps.style,
      "--hover-opacity-from": (hoverOpacityFrom ?? DEFAULT_OPACITY_FROM) / 100,
      "--hover-opacity-to": (hoverOpacityTo ?? DEFAULT_OPACITY_TO) / 100,
    };
  }

  const borderRadius = attributes?.style?.border?.radius;
  if (hoverAnimation === "hover-zoom-bg" && typeof borderRadius === "string" && borderRadius) {
    extraProps.style = {
      ...extraProps.style,
      "--hover-zoom-radius": borderRadius,
    };
  }

  if (classes.length) {
    extraProps.className = classes.join(" ");
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
