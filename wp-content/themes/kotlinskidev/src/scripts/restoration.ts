const RESTORE_MAX_FRAMES = 240;
const RESTORE_STABLE_FRAMES_REQUIRED = 6;

// window.scrollTo() can get silently clamped to the document's scrollHeight at that instant and never re-fire — retry every frame until a stable/capped point is reached.
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
