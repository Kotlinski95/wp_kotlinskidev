const DEFAULT_IDLE_TIMEOUT_MS = 3000;
const FALLBACK_DELAY_MS = 1;

export const whenIdle = (callback: () => void, timeout = DEFAULT_IDLE_TIMEOUT_MS): void => {
  const schedule = (): void => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, { timeout });
      return;
    }
    window.setTimeout(callback, FALLBACK_DELAY_MS);
  };

  if (document.readyState === "complete") {
    schedule();
    return;
  }
  window.addEventListener("load", schedule, { once: true });
};
