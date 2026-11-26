import { useState, useEffect, useMemo } from "react";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";

export interface SlideBlock {
  clientId: string;
  attributes: Record<string, unknown>;
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: SlideBlock[] } | undefined;
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
  selectBlock: (clientId: string) => void;
}

const EMPTY_SLIDES: SlideBlock[] = [];
const EMPTY_CLIENT_IDS: string[] = [];

function useSlideSelection(clientId: string) {
  const { innerBlocks, blockParents, selectedBlockClientId } = useSelect(
    (select) => {
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      const selectedCid = store.getSelectedBlockClientId();
      return {
        innerBlocks: store.getBlock(clientId)?.innerBlocks ?? EMPTY_SLIDES,
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

  return { innerBlocks, selectedBlockParents };
}

function useActiveSlideIndex(innerBlocks: SlideBlock[], selectedBlockParents: string[]) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const idx = innerBlocks.findIndex((b) => selectedBlockParents.includes(b.clientId));
    if (idx >= 0) {
      setActiveSlide(idx);
    }
  }, [selectedBlockParents, innerBlocks]);

  useEffect(() => {
    if (innerBlocks.length > 0 && activeSlide >= innerBlocks.length) {
      setActiveSlide(innerBlocks.length - 1);
    }
  }, [innerBlocks.length, activeSlide]);

  return { activeSlide, setActiveSlide };
}

export function useHeroSlides(clientId: string) {
  const { innerBlocks, selectedBlockParents } = useSlideSelection(clientId);
  const { activeSlide, setActiveSlide } = useActiveSlideIndex(innerBlocks, selectedBlockParents);

  const { insertBlock, removeBlock, selectBlock } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorActions;

  const slideCount = innerBlocks.length;

  const handleNavigate = (index: number) => {
    setActiveSlide(index);
    selectBlock(clientId);
  };

  const handleAddSlide = () => {
    insertBlock(createBlock("kotlinskidev/hero-carousel-slide"), undefined, clientId);
    setActiveSlide(slideCount);
  };

  const handleRemoveSlide = (index: number) => {
    if (slideCount <= 1) {
      return;
    }
    const target = innerBlocks[index];
    if (target) {
      removeBlock(target.clientId);
    }
  };

  return {
    activeSlide,
    innerBlocks,
    slideCount,
    handleNavigate,
    handleAddSlide,
    handleRemoveSlide,
  };
}
