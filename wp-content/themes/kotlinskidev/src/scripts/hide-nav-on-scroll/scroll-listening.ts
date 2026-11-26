import { debounce, onScroll } from "../utils";

const SCROLL_DEBOUNCE_MS = 10;

export interface ScrollHideListening {
  enable: () => void;
  disable: () => void;
}

export const createScrollHideListening = (
  handleScroll: () => void,
  showNav: () => void
): ScrollHideListening => {
  const debouncedHandleScroll = debounce(handleScroll, SCROLL_DEBOUNCE_MS);
  let isListening = false;
  let removeScrollListener: (() => void) | null = null;

  return {
    enable: () => {
      if (isListening) {
        return;
      }
      handleScroll();
      removeScrollListener = onScroll(debouncedHandleScroll);
      isListening = true;
    },
    disable: () => {
      if (!isListening) {
        return;
      }
      removeScrollListener?.();
      removeScrollListener = null;
      showNav();
      isListening = false;
    },
  };
};
