import { animateCounter, cancelActiveAnimations } from "./animated-counter/counter-animation";
import {
  cancelPendingCounterScan,
  watchForNewCounters,
} from "./animated-counter/new-counter-watcher";
import { initCounterAnimations } from "./animated-counter/viewport-trigger";

declare global {
  interface Window {
    kotlinskidevAnimateCounter?: (element: HTMLElement) => void;
    kotlinskidevInitCounters?: () => void;
  }
}

const init = (): void => {
  initCounterAnimations();
  watchForNewCounters(initCounterAnimations);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else if ("requestIdleCallback" in window) {
  requestIdleCallback(init);
} else {
  init();
}

window.addEventListener("beforeunload", () => {
  cancelActiveAnimations();
  cancelPendingCounterScan();
});

window.kotlinskidevAnimateCounter = animateCounter;
window.kotlinskidevInitCounters = initCounterAnimations;
