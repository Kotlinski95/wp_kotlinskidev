import React from "react";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import type { MarqueeEditProps } from "./marquee-attributes";
import { MarqueePanel } from "./marquee-panel";
import { ITEM_BLOCK, useMarqueeItems } from "./use-marquee-items";
import "./style.scss";

export type { MarqueeAttributes } from "./marquee-attributes";

const ALLOWED_BLOCKS = [ITEM_BLOCK];
type InnerTemplate = [string, Record<string, unknown>, InnerTemplate[]?];
const itemGroupTemplate = (label: string): InnerTemplate => [
  ITEM_BLOCK,
  {},
  [["core/group", {}, [["core/paragraph", { className: "kt-marquee-label", content: label }]]]],
];

const ITEMS_TEMPLATE: InnerTemplate[] = [
  itemGroupTemplate("WordPress"),
  itemGroupTemplate("GitHub"),
  itemGroupTemplate("Next.js"),
];

export default function Edit({ attributes, setAttributes, clientId }: MarqueeEditProps) {
  const blockProps = useBlockProps({ className: "kt-marquee-editor" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    allowedBlocks: ALLOWED_BLOCKS,
    template: ITEMS_TEMPLATE,
    orientation: "horizontal",
    renderAppender: () => null,
  });
  const { itemCount, handleAddItem, handleRemoveLast } = useMarqueeItems(clientId);

  return (
    <>
      <MarqueePanel
        attributes={attributes}
        setAttributes={setAttributes}
        itemCount={itemCount}
        onAddItem={handleAddItem}
        onRemoveLast={handleRemoveLast}
      />

      <div {...innerBlocksProps} />
    </>
  );
}
