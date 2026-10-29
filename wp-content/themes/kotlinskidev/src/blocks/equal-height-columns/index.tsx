import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const COLUMNS_BLOCK = "core/columns";
const GROUP_BLOCK = "core/group";
const EQUAL_HEIGHT_CLASS = "kt-equal-height-columns";

interface LayoutAttribute {
  type?: string;
}

interface EqualHeightColumnsAttributes {
  equalHeightColumns?: boolean;
  layout?: LayoutAttribute;
}

const isGridGroup = (name: string | undefined, attributes: EqualHeightColumnsAttributes): boolean =>
  name === GROUP_BLOCK && attributes.layout?.type === "grid";

const isSupportedBlock = (
  name: string | undefined,
  attributes: EqualHeightColumnsAttributes
): boolean => name === COLUMNS_BLOCK || isGridGroup(name, attributes);

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addEqualHeightColumnsAttribute = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== COLUMNS_BLOCK && settings.name !== GROUP_BLOCK) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      equalHeightColumns: { type: "boolean", default: false },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: EqualHeightColumnsAttributes;
  setAttributes: (attrs: Partial<EqualHeightColumnsAttributes>) => void;
}

const withEqualHeightColumnsControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isSupportedBlock(props.name, props.attributes)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const isGrid = isGridGroup(props.name, attributes);

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Equal Height", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={
                isGrid
                  ? __("Equal height grid items", "kotlinskidev")
                  : __("Equal height columns", "kotlinskidev")
              }
              checked={attributes.equalHeightColumns ?? false}
              onChange={(value) => setAttributes({ equalHeightColumns: value })}
              help={
                isGrid
                  ? __(
                      "Stretch every grid item to match the tallest item in its row, so cards line up.",
                      "kotlinskidev"
                    )
                  : __(
                      "Stretch every column's content to match the tallest column, so borders and backgrounds line up.",
                      "kotlinskidev"
                    )
              }
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withEqualHeightColumnsControl");

interface BlockListBlockProps {
  name?: string;
  attributes?: EqualHeightColumnsAttributes;
  className?: string;
  [key: string]: unknown;
}

const withEqualHeightColumnsPreviewClass = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    if (
      !isSupportedBlock(props.name, props.attributes ?? {}) ||
      !props.attributes?.equalHeightColumns
    ) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className ?? ""} ${EQUAL_HEIGHT_CLASS}`.trim()}
      />
    );
  };
}, "withEqualHeightColumnsPreviewClass");

interface SaveExtraProps {
  className?: string;
  [key: string]: unknown;
}

interface BlockTypeInfo {
  name?: string;
}

const applyEqualHeightColumnsSaveClass = (
  extraProps: SaveExtraProps,
  blockType: BlockTypeInfo,
  attributes: EqualHeightColumnsAttributes
): SaveExtraProps => {
  if (!isSupportedBlock(blockType.name, attributes) || !attributes.equalHeightColumns) {
    return extraProps;
  }

  return {
    ...extraProps,
    className: `${extraProps.className ?? ""} ${EQUAL_HEIGHT_CLASS}`.trim(),
  };
};

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/equal-height-columns-attribute",
  addEqualHeightColumnsAttribute
);
addFilter(
  "editor.BlockEdit",
  "kotlinskidev/equal-height-columns-controls",
  withEqualHeightColumnsControl
);
addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/equal-height-columns-preview-class",
  withEqualHeightColumnsPreviewClass
);
addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/equal-height-columns-save-class",
  applyEqualHeightColumnsSaveClass
);
