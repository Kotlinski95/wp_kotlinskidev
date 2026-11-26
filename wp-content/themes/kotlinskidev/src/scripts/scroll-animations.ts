import { onScroll as bindScroll } from "./utils";
import {
  REVEALED_CLASS,
  REVEAL_AFTER_END_SELECTOR,
  SCROLL_ANIMATION_SELECTOR,
  clearWillChangeAfterReveal,
} from "./scroll-animation-selectors";

const REVEAL_VISIBILITY_THRESHOLD = 0.1;
const FALLBACK_REVEAL_MARGIN_PX = 50;

const collectAnimatedElements = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(SCROLL_ANIMATION_SELECTOR)).filter(
    (element) => !element.closest(REVEAL_AFTER_END_SELECTOR)
  );

const reveal = (element: HTMLElement): void => {
  element.classList.add(REVEALED_CLASS);
  clearWillChangeAfterReveal(element);
};

const revealOnIntersection = (elements: HTMLElement[]): void => {
  const observer = new IntersectionObserver(
    (entries, intersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          intersectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: REVEAL_VISIBILITY_THRESHOLD }
  );
  elements.forEach((element) => observer.observe(element));
};

const revealOnScrollFallback = (elements: HTMLElement[]): void => {
  const revealed = new WeakSet<HTMLElement>();
  const onScroll = (): void => {
    const windowHeight = window.innerHeight;
    elements.forEach((element) => {
      const { top } = element.getBoundingClientRect();
      if (top < windowHeight - FALLBACK_REVEAL_MARGIN_PX && !revealed.has(element)) {
        revealed.add(element);
        reveal(element);
      }
    });
  };
  document.addEventListener("DOMContentLoaded", onScroll);
  bindScroll(onScroll);
  window.addEventListener("resize", onScroll);
};

const initScrollAnimations = (): void => {
  const elements = collectAnimatedElements();
  if ("IntersectionObserver" in window) {
    revealOnIntersection(elements);
  } else {
    revealOnScrollFallback(elements);
  }
};

initScrollAnimations();
