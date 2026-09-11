import React from "react";
import { useBlockProps, useInnerBlocksProps, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, Button, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import "./style.scss";

const ITEM_BLOCK = "kotlinskidev/marquee-item";
const ALLOWED_BLOCKS = [ITEM_BLOCK];
const ITEMS_TEMPLATE: [string, Record<string, unknown>][] = [
  [ITEM_BLOCK, { label: "WordPress" }],
  [ITEM_BLOCK, { label: "GitHub" }],
  [ITEM_BLOCK, { label: "Next.js" }],
];

export interface MarqueeAttributes {
  speed: number;
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

interface MarqueeEditProps {
  attributes: MarqueeAttributes;
  setAttributes: (attrs: Partial<MarqueeAttributes>) => void;
  clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: MarqueeEditProps) {
  const blockProps = useBlockProps({ className: "kt-marquee-editor" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    allowedBlocks: ALLOWED_BLOCKS,
    template: ITEMS_TEMPLATE,
    orientation: "horizontal",
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

  const handleAddItem = () => {
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
        <PanelBody title={__("Marquee", "kotlinskidev")} initialOpen>
          <RangeControl
            label={__("Scroll duration (seconds)", "kotlinskidev")}
            help={__("Time for one full loop — lower is faster.", "kotlinskidev")}
            min={5}
            max={120}
            value={attributes.speed}
            onChange={(value) => setAttributes({ speed: value ?? 30 })}
          />
          <p className="kt-marquee-sidebar__count">
            {innerBlocks.length} {__("item(s)", "kotlinskidev")}
          </p>
          <Button
            variant="secondary"
            onClick={handleAddItem}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("+ Add Technology", "kotlinskidev")}
          </Button>
          {innerBlocks.length > 1 && (
            <Button
              variant="tertiary"
              isDestructive
              onClick={handleRemoveLast}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {__("Remove Last Technology", "kotlinskidev")}
            </Button>
          )}
        </PanelBody>
      </InspectorControls>

      <div {...innerBlocksProps} />
    </>
  );
}
