import { collectGlowTargets } from "./hover-glow/glow-target";
import { trackPointerGlow } from "./hover-glow/pointer-tracking";

const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const initHoverGlow = (): void => {
  const targets = collectGlowTargets();
  if (!targets.length) {
    return;
  }

  const supportsHover = window.matchMedia(FINE_HOVER_QUERY).matches;
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  if (!supportsHover || prefersReducedMotion) {
    return;
  }

  targets.forEach(trackPointerGlow);
};

initHoverGlow();
