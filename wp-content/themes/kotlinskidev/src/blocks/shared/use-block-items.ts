import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

export function useBlockItems(clientId: string, itemBlockName: string) {
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

  const addItem = () => {
    insertBlock(createBlock(itemBlockName), undefined, clientId);
  };

  const removeLastItem = () => {
    if (innerBlocks.length <= 1) {
      return;
    }
    const last = innerBlocks[innerBlocks.length - 1];
    if (last) {
      removeBlock(last.clientId);
    }
  };

  return { itemCount: innerBlocks.length, addItem, removeLastItem };
}
