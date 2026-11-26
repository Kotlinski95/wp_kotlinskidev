import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";

interface BlockEditorSelectors {
  getBlockOrder: (id: string) => string[];
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

const EMPTY_CLIENT_IDS: string[] = [];

function useSelectedSlideOrder(clientId: string) {
  const { slideOrder, blockParents, selectedBlockClientId } = useSelect(
    (selectFn) => {
      const store = selectFn(blockEditorStore) as unknown as BlockEditorSelectors;
      const selectedCid = store.getSelectedBlockClientId();
      return {
        slideOrder: store.getBlockOrder(clientId),
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

  return { slideOrder, selectedBlockParents };
}

export function useActiveSlide(clientId: string) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { selectBlock } = useDispatch(blockEditorStore);
  const swiperRef = useRef<HTMLDivElement>(null);
  const { slideOrder, selectedBlockParents } = useSelectedSlideOrder(clientId);

  useEffect(() => {
    const idx = slideOrder.findIndex((id) => selectedBlockParents.includes(id));
    if (idx >= 0) {
      setActiveSlide(idx);
    }
  }, [selectedBlockParents, slideOrder]);

  useEffect(() => {
    if (slideOrder.length > 0 && activeSlide >= slideOrder.length) {
      setActiveSlide(slideOrder.length - 1);
    }
  }, [slideOrder.length, activeSlide]);

  useEffect(() => {
    const wrapperEl = swiperRef.current?.querySelector<HTMLElement>(":scope > .swiper-wrapper");
    const target = wrapperEl?.children[activeSlide] as HTMLElement | undefined;
    target?.scrollIntoView?.({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeSlide]);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    const targetClientId = slideOrder[index];
    if (targetClientId) {
      void selectBlock(targetClientId);
    }
  };

  return { activeSlide, goToSlide, slideOrder, swiperRef };
}
