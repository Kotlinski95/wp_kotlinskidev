import { initMobileOnly, rafThrottle } from "./utils";

const PAGE_SETTLE_MS = 1500;
const ZOOM_THRESHOLD = 1.01;

(function () {
  const viewport = window.visualViewport;
  if (!viewport) {
    return;
  }

  const root = document.documentElement;
  let settleTimer: number | undefined;

  const isTextEntryFocused = () => {
    const active = document.activeElement;
    return (
      active instanceof HTMLElement &&
      (active.isContentEditable ||
        active.matches(
          'textarea, select, input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"])'
        ))
    );
  };

  const isKeyboardOrZoomActive = () => viewport.scale > ZOOM_THRESHOLD || isTextEntryFocused();

  const readOffset = () =>
    isKeyboardOrZoomActive()
      ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
      : 0;

  const applyOffset = (offset: number) => {
    root.style.setProperty("--kt-vv-bottom-offset", `${offset}px`);
  };

  const clearSettleTimer = () => {
    if (settleTimer !== undefined) {
      window.clearTimeout(settleTimer);
      settleTimer = undefined;
    }
  };

  const updateOffset = rafThrottle(() => {
    const offset = readOffset();
    const remainingSettleMs = PAGE_SETTLE_MS - performance.now();

    if (offset === 0 || remainingSettleMs <= 0) {
      clearSettleTimer();
      applyOffset(offset);
      return;
    }

    clearSettleTimer();
    settleTimer = window.setTimeout(updateOffset, remainingSettleMs);
  });

  const updateOffsetWhenVisible = () => {
    if (document.visibilityState === "visible") {
      updateOffset();
    }
  };

  const enable = () => {
    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
    window.addEventListener("resize", updateOffset);
    window.addEventListener("orientationchange", updateOffset);
    window.addEventListener("pageshow", updateOffset);
    window.addEventListener("focus", updateOffset);
    document.addEventListener("focusout", updateOffset);
    document.addEventListener("visibilitychange", updateOffsetWhenVisible);
  };

  const disable = () => {
    clearSettleTimer();
    viewport.removeEventListener("resize", updateOffset);
    viewport.removeEventListener("scroll", updateOffset);
    window.removeEventListener("resize", updateOffset);
    window.removeEventListener("orientationchange", updateOffset);
    window.removeEventListener("pageshow", updateOffset);
    window.removeEventListener("focus", updateOffset);
    document.removeEventListener("focusout", updateOffset);
    document.removeEventListener("visibilitychange", updateOffsetWhenVisible);
    root.style.removeProperty("--kt-vv-bottom-offset");
  };

  initMobileOnly(enable, disable);
})();
