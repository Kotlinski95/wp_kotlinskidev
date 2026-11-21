import React from "react";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import type { BlockEditProps } from "@utils/block-filter-types";
import { NavRevealPanel } from "./nav-reveal-panel";
import {
  NAME_SCOPED_BLOCKS,
  NAVIGATION_ANCESTOR_GATED_BLOCKS,
  addNavRevealAttribute,
  applyNavRevealProps,
} from "./nav-reveal-attributes";
import type { NavRevealAttributes } from "./nav-reveal-attributes";

interface BlockEditorSelectors {
  getBlockParentsByBlockName: (clientId: string, blockName: string) => string[];
}

const isInsideNavigation = (select: (store: string) => unknown, clientId: string): boolean => {
  const blockEditor = select("core/block-editor") as BlockEditorSelectors;
  return blockEditor.getBlockParentsByBlockName(clientId, "core/navigation").length > 0;
};

const withNavRevealControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<NavRevealAttributes>) => {
    const { attributes, setAttributes, name, clientId } = props;

    const isAllowed = useSelect(
      (select) => {
        if (NAME_SCOPED_BLOCKS.includes(name)) {
          return true;
        }
        if (!NAVIGATION_ANCESTOR_GATED_BLOCKS.includes(name)) {
          return false;
        }
        return isInsideNavigation(select, clientId as string);
      },
      [name, clientId]
    );

    if (!isAllowed) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <NavRevealPanel attributes={attributes} setAttributes={setAttributes} />
      </Fragment>
    );
  };
}, "withNavRevealControls");

addFilter("blocks.registerBlockType", "kotlinskidev/nav-reveal-attribute", addNavRevealAttribute);

addFilter("editor.BlockEdit", "kotlinskidev/nav-reveal-controls", withNavRevealControls);

addFilter("blocks.getSaveContent.extraProps", "kotlinskidev/nav-reveal-class", applyNavRevealProps);
