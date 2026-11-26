import React from "react";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import type { BlockEditProps } from "@utils/block-filter-types";
import { CounterPanel } from "./counter-panel";
import {
  addCounterAnimationAttribute,
  applyCounterAnimationClass,
  supportsCounterAnimation,
} from "./counter-attributes";
import type { CounterAnimationAttributes } from "./counter-attributes";

const withCounterAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<CounterAnimationAttributes>) => {
    const { attributes, setAttributes, name } = props;

    if (!supportsCounterAnimation(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <CounterPanel attributes={attributes} setAttributes={setAttributes} />
      </Fragment>
    );
  };
}, "withCounterAnimationControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/counter-animation-attribute",
  addCounterAnimationAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/counter-animation-controls",
  withCounterAnimationControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/counter-animation-class",
  applyCounterAnimationClass
);
