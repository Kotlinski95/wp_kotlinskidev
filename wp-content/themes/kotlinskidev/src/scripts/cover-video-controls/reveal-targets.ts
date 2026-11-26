import { SCROLL_ANIMATION_SELECTOR } from "../scroll-animation-selectors";

const INNER_CONTAINER_SELECTOR = ".wp-block-cover__inner-container";
const FALLBACK_CLASS = "fade-in-on-scroll";

export const resolveRevealTargets = (cover: HTMLElement): HTMLElement[] => {
  const inner = cover.querySelector<HTMLElement>(INNER_CONTAINER_SELECTOR);
  const targets = Array.from(cover.querySelectorAll<HTMLElement>(SCROLL_ANIMATION_SELECTOR));

  if (
    inner &&
    !inner.matches(SCROLL_ANIMATION_SELECTOR) &&
    !inner.querySelector(SCROLL_ANIMATION_SELECTOR)
  ) {
    inner.classList.add(FALLBACK_CLASS);
    targets.push(inner);
  } else if (inner?.matches(SCROLL_ANIMATION_SELECTOR) && !targets.includes(inner)) {
    targets.push(inner);
  }

  return targets;
};
