import { isAccessibilityMotionStopped } from "@utils/accessibility-motion";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let cachedReducedMotion: boolean | null = null;

export const getCachedReducedMotionPreference = (): boolean => {
  if (cachedReducedMotion === null) {
    const motionMediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    cachedReducedMotion = motionMediaQuery.matches;

    motionMediaQuery.addEventListener("change", (e) => {
      cachedReducedMotion = e.matches;
    });
  }
  return cachedReducedMotion || isAccessibilityMotionStopped();
};

export const readReducedMotionPreference = (): boolean =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches || isAccessibilityMotionStopped();
