export const SCROLL_ANIMATION_SELECTORS: readonly string[] = [
  ".appear-on-scroll",
  ".fade-in-on-scroll",
  ".fade-up-on-scroll",
  ".fade-left-on-scroll",
  ".fade-right-on-scroll",
  ".flip-up-on-scroll",
  ".flip-down-on-scroll",
  ".flip-left-on-scroll",
  ".flip-right-on-scroll",
];

export const SCROLL_ANIMATION_SELECTOR = SCROLL_ANIMATION_SELECTORS.join(",");

export const REVEAL_AFTER_END_SELECTOR = "[data-kt-reveal-after-end]";

export const clearWillChangeAfterReveal = (el: HTMLElement): void => {
  el.addEventListener(
    "transitionend",
    () => {
      el.style.willChange = "auto";
    },
    { once: true }
  );
};
