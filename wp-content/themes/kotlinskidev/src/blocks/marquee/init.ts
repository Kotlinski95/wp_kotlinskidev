import {
  ensureSeamlessLoop,
  forceEagerImageLoading,
  growUntilWideEnoughToLoopSeamlessly,
  markClonesNonTabbable,
  type LifetimeCloneBudget,
} from "./marquee-clones";
import { wireMarqueePauseResume } from "./marquee-pause";

export {};

const MAX_CLONE_ITERATIONS = 20;

interface ResizeGrowth {
  el: HTMLElement;
  track: HTMLElement;
  realItemCount: number;
  shiftDistance: number;
}

const growOnResize = (
  { el, track, realItemCount, shiftDistance }: ResizeGrowth,
  cloneBudget: LifetimeCloneBudget
): void => {
  const realItems = Array.from(track.children).slice(0, realItemCount) as HTMLElement[];
  const observer = new ResizeObserver(() => {
    const beforeCount = track.children.length;
    growUntilWideEnoughToLoopSeamlessly(
      { track, unit: realItems, shiftDistance, containerWidth: el.clientWidth },
      cloneBudget
    );
    if (track.children.length !== beforeCount) {
      markClonesNonTabbable(track, realItemCount);
      forceEagerImageLoading(el);
    }
  });
  observer.observe(el);
};

const initMarquee = (el: HTMLElement): void => {
  const track = el.querySelector<HTMLElement>(".kt-marquee__track");
  if (!track) {
    return;
  }
  const realItemCount = track.children.length;
  const cloneBudget: LifetimeCloneBudget = { remaining: MAX_CLONE_ITERATIONS };
  const shiftDistance = ensureSeamlessLoop(track, el, cloneBudget);
  if (shiftDistance > 0) {
    track.style.setProperty("--kt-marquee-shift", `-${shiftDistance}px`);
  }
  markClonesNonTabbable(track, realItemCount);
  forceEagerImageLoading(el);
  wireMarqueePauseResume(el, track);

  if (typeof ResizeObserver === "undefined") {
    return;
  }
  growOnResize({ el, track, realItemCount, shiftDistance }, cloneBudget);
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>(".kt-marquee").forEach(initMarquee);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
