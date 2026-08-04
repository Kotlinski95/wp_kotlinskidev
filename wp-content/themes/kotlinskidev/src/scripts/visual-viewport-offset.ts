import { initMobileOnly, rafThrottle } from "./utils";

(function () {
  const viewport = window.visualViewport;
  if (!viewport) return;

  const root = document.documentElement;

  const updateOffset = rafThrottle(() => {
    const offset = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));
    root.style.setProperty("--kt-vv-bottom-offset", `${offset}px`);
  });

  const enable = () => {
    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
  };

  const disable = () => {
    viewport.removeEventListener("resize", updateOffset);
    viewport.removeEventListener("scroll", updateOffset);
    root.style.removeProperty("--kt-vv-bottom-offset");
  };

  initMobileOnly(enable, disable);
})();
