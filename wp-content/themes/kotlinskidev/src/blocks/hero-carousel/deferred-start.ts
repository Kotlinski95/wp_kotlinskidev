import { onScroll } from "../../scripts/utils";

const VIDEO_START_IDLE_TIMEOUT_MS = 300;
const VIDEO_START_FALLBACK_MS = 100;
const LATE_INIT_TIMEOUT_MS = 1200;
const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

interface SchedulerWindow {
  scheduler?: { yield?: () => Promise<void> };
}

export const whenPageSettled = (callback: () => void): void => {
  const afterLoad = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, { timeout: VIDEO_START_IDLE_TIMEOUT_MS });
    } else {
      setTimeout(callback, VIDEO_START_FALLBACK_MS);
    }
  };
  if (document.readyState === "complete") {
    afterLoad();
  } else {
    window.addEventListener("load", afterLoad, { once: true });
  }
};

export const whenInteractedOrIdle = (callback: () => void): void => {
  let done = false;
  const cleanups: Array<() => void> = [];

  const run = () => {
    if (done) {
      return;
    }
    done = true;
    cleanups.forEach((cleanup) => cleanup());
    callback();
  };

  FIRST_INTERACTION_EVENTS.forEach((type) => {
    window.addEventListener(type, run, { once: true, passive: true });
    cleanups.push(() => window.removeEventListener(type, run));
  });
  cleanups.push(onScroll(run));

  const scheduleIdle = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: LATE_INIT_TIMEOUT_MS });
    } else {
      const timer = setTimeout(run, LATE_INIT_TIMEOUT_MS);
      cleanups.push(() => clearTimeout(timer));
    }
  };

  if (document.readyState === "complete") {
    scheduleIdle();
  } else {
    window.addEventListener("load", scheduleIdle, { once: true });
    cleanups.push(() => window.removeEventListener("load", scheduleIdle));
  }
};

export const yieldToMain = (): Promise<void> => {
  const scheduler = (window as unknown as SchedulerWindow).scheduler;
  if (typeof scheduler?.yield === "function") {
    return scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
};
