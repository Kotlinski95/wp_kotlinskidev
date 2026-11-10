import { REVEAL_AFTER_END_SELECTOR, SCROLL_ANIMATION_SELECTOR } from "./scroll-animation-selectors";

const OBSERVE_LIMIT_MS = 1000;

const flushStyle = (el: HTMLElement): string => window.getComputedStyle(el).opacity;

const isAboveFold = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
};

const isRevealCandidate = (el: HTMLElement): boolean =>
  !el.closest(REVEAL_AFTER_END_SELECTOR) && !el.classList.contains("visible");

const collectWithin = (root: ParentNode, into: HTMLElement[]): void => {
  if (root instanceof HTMLElement && root.matches(SCROLL_ANIMATION_SELECTOR)) {
    into.push(root);
  }
  root.querySelectorAll<HTMLElement>(SCROLL_ANIMATION_SELECTOR).forEach((el) => into.push(el));
};

const revealBatch = (candidates: HTMLElement[]): void => {
  const pending = candidates.filter(isRevealCandidate);
  if (pending.length === 0) {
    return;
  }
  pending.forEach((el) => {
    el.style.transition = "none";
    el.classList.add("visible");
  });
  const belowFold = pending.filter((el) => !isAboveFold(el));
  belowFold.forEach((el) => el.classList.remove("visible"));
  if (belowFold.length > 0) {
    flushStyle(belowFold[0]);
  }
  pending.forEach((el) => el.style.removeProperty("transition"));
};

export const revealAboveFoldForViewTransition = (viewTransition: unknown): void => {
  const initial: HTMLElement[] = [];
  collectWithin(document, initial);
  revealBatch(initial);

  if (typeof MutationObserver === "undefined") {
    return;
  }

  const observer = new MutationObserver((records) => {
    const added: HTMLElement[] = [];
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          collectWithin(node, added);
        }
      });
    });
    revealBatch(added);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const stop = (): void => observer.disconnect();
  const finished = (viewTransition as { finished?: Promise<unknown> } | null)?.finished;
  if (finished && typeof finished.then === "function") {
    finished.then(stop, stop);
  }
  window.setTimeout(stop, OBSERVE_LIMIT_MS);
};
