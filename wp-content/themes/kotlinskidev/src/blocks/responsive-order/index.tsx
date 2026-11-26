import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import { appendClassName } from "@utils/block-filter-types";
import type { BlockEditProps, BlockSettings, ExtraProps } from "@utils/block-filter-types";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import { OrderPanel } from "./order-controls";
import { buildOrderClassString, emptyResponsiveOrder } from "./order-attribute";
import type { ResponsiveOrderAttributes } from "./order-attribute";

const addResponsiveOrderAttributes = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name as string)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveOrder: {
        type: "object",
        default: emptyResponsiveOrder(),
      },
    },
  };
};

const withResponsiveOrderControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ResponsiveOrderAttributes>) => {
    const { attributes, setAttributes } = props;
    const { responsiveOrder = emptyResponsiveOrder() } = attributes;

    const updateResponsiveOrder = (device: ResponsiveDevice, value: number) => {
      setAttributes({
        responsiveOrder: {
          ...responsiveOrder,
          [device]: value,
        },
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <OrderPanel responsiveOrder={responsiveOrder} onChangeOrder={updateResponsiveOrder} />
      </Fragment>
    );
  };
}, "withResponsiveOrderControls");

interface BlockListBlockProps {
  attributes: ResponsiveOrderAttributes;
  className?: string;
}

const addResponsiveOrderClasses = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const additionalClasses = buildOrderClassString(props.attributes.responsiveOrder);

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} ${additionalClasses}`.trim()}
      />
    );
  };
}, "addResponsiveOrderClasses");

const applyResponsiveOrderClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: ResponsiveOrderAttributes
): ExtraProps => {
  const additionalClasses = buildOrderClassString(attributes.responsiveOrder).trim();

  if (additionalClasses) {
    appendClassName(extraProps, additionalClasses);
  }

  return extraProps;
};

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-order-attributes",
  addResponsiveOrderAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-order-controls",
  withResponsiveOrderControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-order-classes",
  addResponsiveOrderClasses
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/responsive-order-save-classes",
  applyResponsiveOrderClass
);
