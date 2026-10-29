import React from "react";
import { useBlockProps, useInnerBlocksProps, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import "./style.scss";

const ITEM_BLOCK = "kotlinskidev/pricing-card";
const ALLOWED_BLOCKS = [ITEM_BLOCK];
const ITEMS_TEMPLATE: [string, Record<string, unknown>][] = [
  [ITEM_BLOCK, {}],
  [ITEM_BLOCK, { featured: true }],
  [ITEM_BLOCK, {}],
];

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

export default function Edit({ clientId }: { clientId: string }) {
  const blockProps = useBlockProps({ className: "pricing-cards" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    allowedBlocks: ALLOWED_BLOCKS,
    template: ITEMS_TEMPLATE,
    renderAppender: () => null,
  });

  const { innerBlocks } = useSelect(
    (select) => ({
      innerBlocks:
        (select("core/block-editor") as unknown as BlockEditorSelectors).getBlock(clientId)
          ?.innerBlocks ?? [],
    }),
    [clientId]
  );

  const { insertBlock, removeBlock } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorActions;

  const handleAddTier = () => {
    insertBlock(createBlock(ITEM_BLOCK), undefined, clientId);
  };

  const handleRemoveLast = () => {
    if (innerBlocks.length <= 1) {
      return;
    }
    const last = innerBlocks[innerBlocks.length - 1];
    if (last) {
      removeBlock(last.clientId);
    }
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Pricing Tiers", "kotlinskidev")} initialOpen>
          <p className="pricing-cards-sidebar__count">
            {innerBlocks.length} {__("tier(s)", "kotlinskidev")}
          </p>
          <Button
            variant="secondary"
            onClick={handleAddTier}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("+ Add Tier", "kotlinskidev")}
          </Button>
          {innerBlocks.length > 1 && (
            <Button
              variant="tertiary"
              isDestructive
              onClick={handleRemoveLast}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {__("Remove Last Tier", "kotlinskidev")}
            </Button>
          )}
        </PanelBody>
      </InspectorControls>

      <div {...innerBlocksProps} />
    </>
  );
}
