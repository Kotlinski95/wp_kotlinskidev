import { useState, useEffect, useMemo } from "react";
import { useSelect } from "@wordpress/data";

interface TabItemBlock {
  clientId: string;
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: TabItemBlock[] } | undefined;
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

const EMPTY_BLOCKS: TabItemBlock[] = [];
const EMPTY_CLIENT_IDS: string[] = [];

export function useActiveTab(clientId: string) {
  const [activeTab, setActiveTab] = useState(0);

  const { innerBlocks, blockParents, selectedBlockClientId } = useSelect(
    (select) => {
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      const selectedCid = store.getSelectedBlockClientId();
      return {
        innerBlocks: store.getBlock(clientId)?.innerBlocks ?? EMPTY_BLOCKS,
        blockParents: selectedCid ? store.getBlockParents(selectedCid) : EMPTY_CLIENT_IDS,
        selectedBlockClientId: selectedCid,
      };
    },
    [clientId]
  );

  const selectedBlockParents = useMemo(
    () => (selectedBlockClientId ? [...blockParents, selectedBlockClientId] : EMPTY_CLIENT_IDS),
    [blockParents, selectedBlockClientId]
  );

  useEffect(() => {
    const idx = innerBlocks.findIndex((block) => selectedBlockParents.includes(block.clientId));
    if (idx >= 0) {
      setActiveTab(idx);
    }
  }, [selectedBlockParents, innerBlocks]);

  useEffect(() => {
    if (innerBlocks.length > 0 && activeTab >= innerBlocks.length) {
      setActiveTab(innerBlocks.length - 1);
    }
  }, [innerBlocks.length, activeTab]);

  const activeItemClientId = innerBlocks[activeTab]?.clientId ?? null;

  return { activeTab, activeItemClientId };
}
