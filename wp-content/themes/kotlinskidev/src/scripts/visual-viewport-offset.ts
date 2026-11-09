import { initMobileOnly, rafThrottle } from "./utils";

const PAGE_SETTLE_MS = 1500;

(function () {
  const viewport = window.visualViewport;
  if (!viewport) {
    return;
  }

  const root = document.documentElement;
  let settleTimer: number | undefined;

  const readOffset = () => Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));

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

  const enable = () => {
    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
  };

  const disable = () => {
    clearSettleTimer();
    viewport.removeEventListener("resize", updateOffset);
    viewport.removeEventListener("scroll", updateOffset);
    root.style.removeProperty("--kt-vv-bottom-offset");
  };

  initMobileOnly(enable, disable);
})();
