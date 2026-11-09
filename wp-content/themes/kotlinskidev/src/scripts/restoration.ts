import { beginProgrammaticScroll, endProgrammaticScroll } from "./utils";

const RESTORE_MAX_FRAMES = 240;
const RESTORE_STABLE_FRAMES_REQUIRED = 6;

// window.scrollTo() can get silently clamped to the document's scrollHeight at that instant and never re-fire — retry every frame until a stable/capped point is reached.
function restoreScroll(target: number): void {
  let lastY = -1;
  let stableFrames = 0;
  let frame = 0;

  beginProgrammaticScroll();

  const tick = (): void => {
    window.scrollTo(0, target);
    const y = window.scrollY;
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
}

const STORAGE_KEY_PREFIX = "kt-scroll:";

function storageKey(): string {
  return `${STORAGE_KEY_PREFIX}${window.location.pathname}${window.location.search}`;
}

function readNavigationType(): string {
  const entries = performance.getEntriesByType("navigation");
  if (entries.length > 0 && entries[0] instanceof PerformanceNavigationTiming) {
    return entries[0].type;
  }
  return "navigate";
}

function readStoredPosition(): number | null {
  try {
    const raw = sessionStorage.getItem(storageKey());
    if (raw === null) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeStoredPosition(position: number): boolean {
  try {
    sessionStorage.setItem(storageKey(), `${position}`);
    return true;
  } catch {
    return false;
  }
}

(function () {
  window.addEventListener("pagehide", () => {
    writeStoredPosition(window.scrollY);
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      return;
    }
    const navigationType = readNavigationType();
    if (navigationType !== "back_forward" && navigationType !== "reload") {
      return;
    }
    const position = readStoredPosition();
    if (position !== null) {
      restoreScroll(position);
    }
  });
})();
