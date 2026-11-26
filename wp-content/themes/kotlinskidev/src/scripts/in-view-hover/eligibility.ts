import { isLinkLike } from "../in-view-hover-selector";

const OPT_OUT_SELECTOR = ".kt-in-view-hover-off";
const PROTECTED_CONTENT_SELECTOR = ".protected-content";
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

const isProtectedContentRelated = (element: Element): boolean =>
  Boolean(element.closest(PROTECTED_CONTENT_SELECTOR)) ||
  Boolean(element.querySelector(PROTECTED_CONTENT_SELECTOR));

export const isEligible = (element: Element, includeLinks: boolean): boolean =>
  !element.closest(OPT_OUT_SELECTOR) &&
  !isProtectedContentRelated(element) &&
  (includeLinks || !isLinkLike(element)) &&
  !isInsideHorizontalScroller(element);
