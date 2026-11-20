import { setScrollBehavior } from "../utils";
import { matchReducedMotionQuery } from "./reduced-motion-query";

const REDUCE_MOTION_BODY_CLASS = "reduce-motion";
const CLEARED_SCROLL_BEHAVIOR = "" as ScrollBehavior;
const MOTION_PREFERENCE_CHANGED_EVENT = "motionPreferenceChanged";

function dispatchMotionPreferenceChanged(prefersReducedMotion: boolean): void {
  window.dispatchEvent(
    new CustomEvent(MOTION_PREFERENCE_CHANGED_EVENT, { detail: { prefersReducedMotion } })
  );
}

function applyReducedMotion(): void {
  document.body.classList.add(REDUCE_MOTION_BODY_CLASS);
  setScrollBehavior("auto");
  dispatchMotionPreferenceChanged(true);
}

function applyFullMotion(): void {
  document.body.classList.remove(REDUCE_MOTION_BODY_CLASS);
  setScrollBehavior(CLEARED_SCROLL_BEHAVIOR);
  dispatchMotionPreferenceChanged(false);
}

function applyMotionPreference(prefersReducedMotion: boolean): void {
  if (prefersReducedMotion) {
    applyReducedMotion();
  } else {
    applyFullMotion();
  }
}

export function syncMotionPreferenceWithSystem(): void {
  const mediaQuery = matchReducedMotionQuery();

  applyMotionPreference(mediaQuery.matches);

  mediaQuery.addEventListener("change", (event) => applyMotionPreference(event.matches));
}
