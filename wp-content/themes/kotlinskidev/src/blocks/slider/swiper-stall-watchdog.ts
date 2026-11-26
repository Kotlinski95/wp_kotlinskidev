import type Swiper from "swiper";
import { advanceOrWrapToNearestSnap, type AutoplayPace } from "./swiper-catch-up";
import {
  asTranslateControl,
  freezeAtCurrentPosition,
  readTranslateXAcceptingWebKitMatrix3d,
} from "./swiper-translate";

const STALL_GRACE_AFTER_MOTIONLESS_MS = 300;
const STALL_CHECK_INTERVAL_MS = 100;
const MOTION_TOLERANCE_PX = 0.5;

export function startStallWatchdog(
  swiper: Swiper,
  { speed, reverse }: AutoplayPace,
  isPausedByUs: () => boolean
): () => void {
  let lastObservedTranslateX: number | null = null;
  let lastProgressAt = Date.now();

  const intervalId = setInterval(() => {
    if (swiper.destroyed || isPausedByUs()) {
      return;
    }
    const controllable = asTranslateControl(swiper);
    if (!controllable.wrapperEl) {
      return;
    }
    const currentTranslateX = readTranslateXAcceptingWebKitMatrix3d(controllable.wrapperEl);
    const now = Date.now();
    if (
      lastObservedTranslateX === null ||
      Math.abs(currentTranslateX - lastObservedTranslateX) > MOTION_TOLERANCE_PX
    ) {
      lastObservedTranslateX = currentTranslateX;
      lastProgressAt = now;
      return;
    }
    if (now - lastProgressAt > STALL_GRACE_AFTER_MOTIONLESS_MS) {
      freezeAtCurrentPosition(swiper);
      advanceOrWrapToNearestSnap(swiper, speed, reverse);
      lastObservedTranslateX = null;
      lastProgressAt = now;
    }
  }, STALL_CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
