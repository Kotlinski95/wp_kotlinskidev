import { getScrollTop, scrollTo } from "../utils";

export const SCROLL_GUARD_FRAMES = 40;

export const guardScrollPosition = (targetY: number, framesRemaining: number): void => {
  if (getScrollTop() !== targetY) {
    scrollTo(targetY, "instant");
  }
  if (framesRemaining <= 0) {
    return;
  }
  requestAnimationFrame(() => guardScrollPosition(targetY, framesRemaining - 1));
};
