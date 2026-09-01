import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import React from "react";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

const backgroundEffects = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Gradient Shift", "kotlinskidev"), value: "kt-bg-fx-gradient-shift" },
  { label: __("Aurora", "kotlinskidev"), value: "kt-bg-fx-aurora" },
  { label: __("Shimmer Text", "kotlinskidev"), value: "kt-bg-fx-shimmer-text" },
  { label: __("Wave", "kotlinskidev"), value: "kt-bg-fx-wave" },
  { label: __("Glow Border", "kotlinskidev"), value: "kt-bg-fx-glow-border" },
];

const excludedBlocks = [
  "core/html",
  "core/code",
  "core/preformatted",
  "core/verse",
  ...DYNAMIC_PREVIEW_BLOCKS,
];

function addBackgroundEffectAttribute(settings: any) {
  if (excludedBlocks.includes(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      backgroundEffect: {
        type: "string",
        default: "",
      },
      backgroundEffectColor1: {
        type: "string",
        default: "",
      },
      backgroundEffectColor2: {
        type: "string",
        default: "",
      },
      backgroundEffectColor3: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
}

const withBackgroundEffectControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes, name } = props;
    const {
      backgroundEffect,
      backgroundEffectColor1,
      backgroundEffectColor2,
      backgroundEffectColor3,
    } = attributes;

    if (excludedBlocks.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Background Effects", "kotlinskidev")}
            icon="art"
            initialOpen={false}
          >
            <SelectControl
              label={__("Effect", "kotlinskidev")}
              value={backgroundEffect || ""}
              options={backgroundEffects}
              onChange={(value: string) => setAttributes({ backgroundEffect: value })}
              help={__(
                "Applies an animated CSS background/border effect. Shimmer Text is meant for text blocks; the others work best on containers and Cover blocks.",
                "kotlinskidev"
              )}
            />
            {backgroundEffect && (
              <>
                <ColorGradientControl
                  label={__("Effect color 1", "kotlinskidev")}
                  colorValue={backgroundEffectColor1 || undefined}
                  onColorChange={(value: string | undefined) =>
                    setAttributes({ backgroundEffectColor1: value || "" })
                  }
                  enableAlpha={true}
                  clearable={true}
                  __experimentalIsRenderedInSidebar={true}
                  __nextHasNoMarginBottom
                />
                <ColorGradientControl
                  label={__("Effect color 2", "kotlinskidev")}
                  colorValue={backgroundEffectColor2 || undefined}
                  onColorChange={(value: string | undefined) =>
                    setAttributes({ backgroundEffectColor2: value || "" })
                  }
                  enableAlpha={true}
                  clearable={true}
                  __experimentalIsRenderedInSidebar={true}
                  __nextHasNoMarginBottom
                />
                <ColorGradientControl
                  label={__("Effect color 3", "kotlinskidev")}
                  colorValue={backgroundEffectColor3 || undefined}
                  onColorChange={(value: string | undefined) =>
                    setAttributes({ backgroundEffectColor3: value || "" })
                  }
                  enableAlpha={true}
                  clearable={true}
                  __experimentalIsRenderedInSidebar={true}
                  __nextHasNoMarginBottom
                />
                <p className="components-base-control__help">
                  {__(
                    "Leave a color empty to keep the theme's default. Not every effect uses all three.",
                    "kotlinskidev"
                  )}
                </p>
                {backgroundEffect === "kt-bg-fx-glow-border" && (
                  <p className="components-base-control__help">
                    {__(
                      "Only the color animates. Border width and radius come from this block's own Border settings; set them there.",
                      "kotlinskidev"
                    )}
                  </p>
                )}
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </>
    );
  };
}, "withBackgroundEffectControls");

function applyBackgroundEffectClass(extraProps: any, blockType: any, attributes: any) {
  const {
    backgroundEffect,
    backgroundEffectColor1,
    backgroundEffectColor2,
    backgroundEffectColor3,
  } = attributes;

  const classes = [extraProps.className, backgroundEffect].filter(Boolean);

  if (classes.length) {
    extraProps.className = classes.join(" ");
  }

  const borderWidth = attributes?.style?.border?.width;
  const passBorderWidth =
    backgroundEffect === "kt-bg-fx-glow-border" && typeof borderWidth === "string" && borderWidth;

  if (
    backgroundEffect &&
    (backgroundEffectColor1 || backgroundEffectColor2 || backgroundEffectColor3 || passBorderWidth)
  ) {
    extraProps.style = {
      ...extraProps.style,
      ...(backgroundEffectColor1 && { "--kt-bg-fx-color-1": backgroundEffectColor1 }),
      ...(backgroundEffectColor2 && { "--kt-bg-fx-color-2": backgroundEffectColor2 }),
      ...(backgroundEffectColor3 && { "--kt-bg-fx-color-3": backgroundEffectColor3 }),
      ...(passBorderWidth && { "--kt-bg-fx-border-width": borderWidth }),
    };
  }

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/background-effect-attribute",
  addBackgroundEffectAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/background-effect-controls",
  withBackgroundEffectControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/background-effect-class",
  applyBackgroundEffectClass
);
