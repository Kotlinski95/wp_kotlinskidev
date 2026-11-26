import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";

export const ITEM_BLOCK = "kotlinskidev/marquee-item";

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

export function useMarqueeItems(clientId: string) {
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
    insertBlock(
      createBlock(ITEM_BLOCK, {}, [
        createBlock("core/group", {}, [
          createBlock("core/image", { className: "kt-marquee-icon" }),
          createBlock("core/paragraph", { className: "kt-marquee-label" }),
        ]),
      ]),
      undefined,
      clientId
    );
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

  return { itemCount: innerBlocks.length, handleAddItem, handleRemoveLast };
}
