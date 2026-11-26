import { beginProgrammaticScroll, endProgrammaticScroll, getScrollTop, scrollTo } from "../utils";

const RESTORE_MAX_FRAMES = 240;
const RESTORE_STABLE_FRAMES_REQUIRED = 6;

export const restoreScrollUntilStable = (target: number): void => {
  let lastY = -1;
  let stableFrames = 0;
  let frame = 0;

  beginProgrammaticScroll();

  const tick = (): void => {
    scrollTo(target, "instant");
    const y = getScrollTop();
    stableFrames = Math.abs(y - lastY) < 1 ? stableFrames + 1 : 0;
    lastY = y;
    frame += 1;
    if (stableFrames >= RESTORE_STABLE_FRAMES_REQUIRED || frame >= RESTORE_MAX_FRAMES) {
      endProgrammaticScroll();
      return;
    }
    requestAnimationFrame(tick);
  };

  tick();
};
