import {
  getScrollHeight,
  getScrollTop,
  getScrollViewportHeight,
  isProgrammaticScrollActive,
} from "../utils";
import type { NavVisibility } from "./nav-visibility";

const SCROLL_THRESHOLD = 10;
const TOP_THRESHOLD = 100;
const BOTTOM_THRESHOLD = 100;

const isNearBottom = (scrollTop: number): boolean =>
  getScrollHeight() - (scrollTop + getScrollViewportHeight()) < BOTTOM_THRESHOLD;

export const createScrollDirectionHandler = ({ showNav, hideNav }: NavVisibility): (() => void) => {
  let lastScrollTop = 0;

  const syncAfterProgrammaticScroll = (scrollTop: number): void => {
    lastScrollTop = scrollTop;
    if (scrollTop < TOP_THRESHOLD) {
      showNav();
    }
  };

  return () => {
    const scrollTop = getScrollTop();

    if (isProgrammaticScrollActive()) {
      syncAfterProgrammaticScroll(scrollTop);
      return;
    }

    const isScrollingDown = scrollTop > lastScrollTop;
    if (Math.abs(scrollTop - lastScrollTop) < SCROLL_THRESHOLD) {
      return;
    }

    if (scrollTop < TOP_THRESHOLD || isNearBottom(scrollTop)) {
      showNav();
    } else if (isScrollingDown) {
      hideNav();
    } else {
      showNav();
    }
    lastScrollTop = scrollTop;
  };
};
