const RESTORE_MAX_FRAMES = 240;
const RESTORE_STABLE_FRAMES_REQUIRED = 6;

// A `kotlinskidev/scroll-section` pin (`pinSpacing: false`) only grows the document's real
// scrollHeight in response to `scroll` events, as the user actually passes through it
// (scroll-trigger-refresh.ts's growSpacerForHiddenOverflow()) — confirmed live: a page's
// scrollHeight can more than double between a fresh load and the true bottom of a
// multi-scroll-section page. A single window.scrollTo(0, target) call gets silently clamped
// to whatever the still-small, ungrown scrollHeight is *at that instant*, and nothing ever
// re-issues it, so the page gets stuck partway — confirmed live via a real reload-and-restore
// repro landing at scrollY 8453 against a saved target of 16495. Retrying scrollTo() every
// frame re-fires the same scroll event that drives the growth logic each time, which converges
// on the real target exactly the same way continuous real scrolling does — confirmed live this
// reaches the exact saved position once the page has fully grown. Bounded by both a stable-frame
// count (target reached, or genuinely unreachable and the page stopped growing) and a hard frame
// cap (safety net against a page that never stabilizes).
function restoreScroll(target: number): void {
  let lastY = -1;
  let stableFrames = 0;
  let frame = 0;

  const tick = (): void => {
    window.scrollTo(0, target);
    const y = window.scrollY;
    stableFrames = Math.abs(y - lastY) < 1 ? stableFrames + 1 : 0;
    lastY = y;
    frame += 1;
    if (stableFrames >= RESTORE_STABLE_FRAMES_REQUIRED || frame >= RESTORE_MAX_FRAMES) {
      return;
    }
    requestAnimationFrame(tick);
  };

  tick();
}

(function () {
  window.addEventListener("pagehide", () => {
    localStorage.setItem("scrollPosition", `${window.scrollY}`);
  });

  window.addEventListener("pageshow", (event) => {
    const navigationEntries = performance.getEntriesByType("navigation");
    let navigationType: string;
    if (
      navigationEntries.length > 0 &&
      navigationEntries[0] instanceof PerformanceNavigationTiming
    ) {
      navigationType = navigationEntries[0].type;
    } else if (event.persisted) {
      navigationType = "back_forward";
    } else {
      navigationType = "navigate";
    }

    if (navigationType === "back_forward" || navigationType === "reload") {
      const scrollPosition = localStorage.getItem("scrollPosition");
      if (scrollPosition) {
        restoreScroll(+scrollPosition);
      }
    }
  });
})();
