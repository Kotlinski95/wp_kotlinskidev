import { getElementScrollTop, getScrollOffsets, isMobile, scrollTo } from "../utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const getHeaderOffset = (): number => {
  const offsets = getScrollOffsets();
  return isMobile() ? offsets.mobile : offsets.desktop;
};

const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const scrollToElementWithOffset = (element: Element): void => {
  const offsetTop = getElementScrollTop(element) - getHeaderOffset();
  const scrollBehavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  scrollTo(Math.max(0, offsetTop), scrollBehavior);
};
