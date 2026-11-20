import { isLinkLike } from "../in-view-hover-selector";

const OPT_OUT_SELECTOR = ".kt-in-view-hover-off";
const CAROUSEL_SELECTOR =
  ".swiper, .kt-slider, .wp-block-kotlinskidev-slider, .wp-block-wpe-slider";
const SCROLLING_OVERFLOW = /^(auto|scroll)$/;

const isInsideHorizontalScroller = (element: Element): boolean => {
  if (element.closest(CAROUSEL_SELECTOR)) {
    return true;
  }
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (SCROLLING_OVERFLOW.test(window.getComputedStyle(ancestor).overflowX)) {
      return true;
    }
  }
  return false;
};

export const isEligible = (element: Element, includeLinks: boolean): boolean =>
  !element.closest(OPT_OUT_SELECTOR) &&
  (includeLinks || !isLinkLike(element)) &&
  !isInsideHorizontalScroller(element);
