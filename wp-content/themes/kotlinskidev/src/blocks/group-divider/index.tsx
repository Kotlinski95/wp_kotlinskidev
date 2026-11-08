import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const GROUP_DIVIDER_BLOCKS = ["core/group"];

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsGroupDivider = (name?: string): boolean =>
  Boolean(name && GROUP_DIVIDER_BLOCKS.includes(name));

const addGroupDividerAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsGroupDivider(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevDividerBetween: { type: "boolean", default: false },
    },
  };
};

interface GroupDividerAttributes {
  kotlinskidevDividerBetween?: boolean;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & GroupDividerAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withGroupDividerControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsGroupDivider(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const dividerBetween = Boolean(attributes.kotlinskidevDividerBetween);

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Divider Lines", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Show divider lines between items", "kotlinskidev")}
              checked={dividerBetween}
              onChange={(next) => setAttributes({ kotlinskidevDividerBetween: next })}
              help={__(
                "Draws a line between each direct child using this group's own Border color/width (set those in the Border panel above). Works reliably for a single column, a row, or a Grid layout with a fixed column count. A responsive Grid without a fixed column count falls back to a border on every cell — use a background color + a small block gap instead if that looks uneven.",
                "kotlinskidev"
              )}
              __nextHasNoMarginBottom
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withGroupDividerControls");

interface SaveContentExtraProps {
  className?: string;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

interface SaveAttributes extends GroupDividerAttributes {
  layout?: {
    type?: string;
    orientation?: string;
    columnCount?: number;
    minimumColumnWidth?: string;
  };
}

const MAX_DIVIDER_GRID_COLUMNS = 12;

function applyGroupDividerProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: SaveAttributes
): SaveContentExtraProps {
  if (!supportsGroupDivider(blockType.name) || !attributes.kotlinskidevDividerBetween) {
    return extraProps;
  }

  const layoutType = attributes.layout?.type;
  const columnCount = attributes.layout?.columnCount;
  const isResponsiveGrid = Boolean(attributes.layout?.minimumColumnWidth);

  let className: string;
  if (layoutType === "grid") {
    className =
      !isResponsiveGrid &&
      typeof columnCount === "number" &&
      Number.isInteger(columnCount) &&
      columnCount >= 1 &&
      columnCount <= MAX_DIVIDER_GRID_COLUMNS
        ? `has-divider-between-grid-cols-${columnCount}`
        : "has-divider-between-grid";
  } else {
    const isHorizontalRow = layoutType === "flex" && attributes.layout?.orientation !== "vertical";
    className = isHorizontalRow ? "has-divider-between-x" : "has-divider-between-y";
  }

  extraProps.className = extraProps.className ? `${extraProps.className} ${className}` : className;

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/group-divider-attributes",
  addGroupDividerAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/group-divider-controls", withGroupDividerControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/group-divider-props",
  applyGroupDividerProps
);
