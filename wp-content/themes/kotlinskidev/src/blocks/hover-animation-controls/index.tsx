import React from "react";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import type { BlockEditProps } from "@utils/block-filter-types";
import { HoverPanel } from "./hover-panel";
import { addHoverAnimationAttribute, isHoverExcludedBlock } from "./hover-attributes";
import type { HoverAnimationAttributes } from "./hover-attributes";
import { applyHoverAnimationClass } from "./hover-save-props";
import { usePendingColorChange } from "./use-pending-color-change";

const withHoverAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<HoverAnimationAttributes>) => {
    const { attributes, setAttributes, name } = props;

    const onBackgroundColorChange = usePendingColorChange("hoverBackgroundColor", setAttributes);
    const onTextColorChange = usePendingColorChange("hoverTextColor", setAttributes);

    if (isHoverExcludedBlock(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <HoverPanel
          blockName={name}
          attributes={attributes}
          setAttributes={setAttributes}
          onBackgroundColorChange={onBackgroundColorChange}
          onTextColorChange={onTextColorChange}
        />
      </Fragment>
    );
  };
}, "withHoverAnimationControls");

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
