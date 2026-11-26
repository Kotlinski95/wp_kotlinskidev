import React from "react";
import { createBlock } from "@wordpress/blocks";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { DEFAULT_BLOCK, DEFAULT_BLOCK_ATTRIBUTES } from "./constants";
import PLACEHOLDER_IMG_3 from "./assets/image3.webp";

export const SliderToolbar = ({ clientId }: { clientId: string }): React.ReactElement => {
  const { insertBlock, selectBlock } = useDispatch(blockEditorStore);
  const innerBlocks = useSelect(
    (selectFn) => selectFn(blockEditorStore).getBlock(clientId)?.innerBlocks ?? [],
    [clientId]
  );

  const addSlide = () => {
    const block = createBlock(DEFAULT_BLOCK, {
      url: `${PLACEHOLDER_IMG_3}`,
      ...DEFAULT_BLOCK_ATTRIBUTES,
    });
    void insertBlock(block, innerBlocks.length, clientId, false);
    void selectBlock(block.clientId);
  };

  return (
    <ToolbarGroup>
      <ToolbarButton icon="plus" onClick={addSlide}>
        {__("Add Slide", "kotlinskidev")}
      </ToolbarButton>
    </ToolbarGroup>
  );
};
