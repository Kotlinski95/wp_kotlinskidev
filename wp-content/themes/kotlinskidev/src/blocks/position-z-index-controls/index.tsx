import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { SelectControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

type PositionValue = "" | "static" | "relative" | "absolute" | "sticky";
type ZIndexValue = "" | "below" | "0" | "1" | "2" | "3" | "4" | "5";

interface BlockAttributes {
  kotlinskidevPosition?: PositionValue;
  kotlinskidevZIndex?: ZIndexValue;
}

interface BlockEditProps {
  name?: string;
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const POSITION_Z_INDEX_SUPPORTED_DYNAMIC_BLOCKS = ["kotlinskidev/certificate"];

const excludedDynamicPreviewBlocks = DYNAMIC_PREVIEW_BLOCKS.filter(
  (name) => !POSITION_Z_INDEX_SUPPORTED_DYNAMIC_BLOCKS.includes(name)
);

const positionOptions: { label: string; value: PositionValue }[] = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Static", "kotlinskidev"), value: "static" },
  { label: __("Relative", "kotlinskidev"), value: "relative" },
  { label: __("Absolute", "kotlinskidev"), value: "absolute" },
  { label: __("Sticky", "kotlinskidev"), value: "sticky" },
];

const zIndexOptions: { label: string; value: ZIndexValue }[] = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Below content (-1)", "kotlinskidev"), value: "below" },
  { label: __("0", "kotlinskidev"), value: "0" },
  { label: __("1", "kotlinskidev"), value: "1" },
  { label: __("2", "kotlinskidev"), value: "2" },
  { label: __("3", "kotlinskidev"), value: "3" },
  { label: __("4", "kotlinskidev"), value: "4" },
  { label: __("5", "kotlinskidev"), value: "5" },
];

const positionClassFor = (position?: PositionValue): string =>
  position ? `kt-position-${position}` : "";

const zIndexClassFor = (zIndex?: ZIndexValue): string => (zIndex ? `kt-z-${zIndex}` : "");

const addPositionZIndexAttributes = (settings: BlockSettings): BlockSettings => {
  if (excludedDynamicPreviewBlocks.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevPosition: { type: "string", default: "" },
      kotlinskidevZIndex: { type: "string", default: "" },
    },
  };
};

const withPositionZIndexControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (excludedDynamicPreviewBlocks.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const position = attributes.kotlinskidevPosition ?? "";
    const zIndex = attributes.kotlinskidevZIndex ?? "";

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorAdvancedControls>
          <SelectControl
            label={__("Position", "kotlinskidev")}
            value={position}
            options={positionOptions}
            onChange={(value) => setAttributes({ kotlinskidevPosition: value as PositionValue })}
            help={__(
              "Needed on a block's own container before a child can be absolutely positioned inside it (e.g. a canvas background layer).",
              "kotlinskidev"
            )}
          />
          <SelectControl
            label={__("Stacking order (z-index)", "kotlinskidev")}
            value={zIndex}
            options={zIndexOptions}
            onChange={(value) => setAttributes({ kotlinskidevZIndex: value as ZIndexValue })}
            help={__(
              "Controls which block paints on top when blocks overlap. Only takes effect once Position above is not Default.",
              "kotlinskidev"
            )}
          />
        </InspectorAdvancedControls>
      </Fragment>
    );
  };
}, "withPositionZIndexControls");

const addPositionZIndexClasses = createHigherOrderComponent((BlockListBlock) => {
  return (props: { attributes: BlockAttributes; className?: string; [key: string]: unknown }) => {
    const { attributes } = props;
    const classes = [
      positionClassFor(attributes.kotlinskidevPosition),
      zIndexClassFor(attributes.kotlinskidevZIndex),
    ]
      .filter(Boolean)
      .join(" ");

    if (!classes) {
      return <BlockListBlock {...props} />;
    }

    return <BlockListBlock {...props} className={`${props.className || ""} ${classes}`.trim()} />;
  };
}, "addPositionZIndexClasses");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/position-z-index-attributes",
  addPositionZIndexAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/position-z-index-controls", withPositionZIndexControls);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/position-z-index-classes",
  addPositionZIndexClasses
);
