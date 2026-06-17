import { getScrollTop, isMobile, onScroll, onScreenSizeChange } from "./utils";

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header") as HTMLElement | null;
  if (!header) return;

  const stickyThreshold = 30;
  let rafId: number | null = null;

  const handleScroll = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      header.classList.toggle("header-sticky", getScrollTop() > stickyThreshold);
      rafId = null;
    });
  };

  let removeListener: (() => void) | null = null;

  const enable = () => {
    if (removeListener) return;
    handleScroll();
    removeListener = onScroll(handleScroll);
  };

  const disable = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    removeListener?.();
    removeListener = null;
    header.classList.remove("header-sticky");
  };

  const handleScreenSizeChange = (mobile: boolean) => {
    if (mobile) {
      disable();
    } else {
      enable();
    }
  };

  handleScreenSizeChange(isMobile());
  onScreenSizeChange(handleScreenSizeChange);
});
