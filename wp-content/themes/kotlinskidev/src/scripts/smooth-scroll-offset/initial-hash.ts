import { scrollToElementWithOffset } from "./scroll-to-element";

const INITIAL_HASH_SCROLL_DELAY_MS = 100;

export const scrollToHashTarget = (): void => {
  if (!window.location.hash) {
    return;
  }
  const targetElement = document.getElementById(window.location.hash.substring(1));
  if (!targetElement) {
    return;
  }
  setTimeout(() => {
    scrollToElementWithOffset(targetElement);
    targetElement.focus();
  }, INITIAL_HASH_SCROLL_DELAY_MS);
};
