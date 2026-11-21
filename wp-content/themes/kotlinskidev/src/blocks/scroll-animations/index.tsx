import React from "react";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import type { BlockEditProps } from "@utils/block-filter-types";
import { ScrollAnimationPanel } from "./scroll-animation-panel";
import {
  addScrollAnimationAttribute,
  applyScrollAnimationClass,
  isScrollAnimationExcludedBlock,
} from "./scroll-animation-attributes";
import type { ScrollAnimationAttributes } from "./scroll-animation-attributes";

const withScrollAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<ScrollAnimationAttributes>) => {
    const { attributes, setAttributes, name } = props;

    if (isScrollAnimationExcludedBlock(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <ScrollAnimationPanel attributes={attributes} setAttributes={setAttributes} />
      </Fragment>
    );
  };
}, "withScrollAnimationControls");

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
