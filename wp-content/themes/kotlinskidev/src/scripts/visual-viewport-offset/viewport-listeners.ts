export interface ViewportListeners {
  bind: () => void;
  unbind: () => void;
}

export const createViewportListeners = (
  viewport: VisualViewport,
  update: () => void
): ViewportListeners => {
  const updateWhenVisible = (): void => {
    if (document.visibilityState === "visible") {
      update();
    }
  };

  const bind = (): void => {
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("pageshow", update);
    window.addEventListener("focus", update);
    document.addEventListener("focusout", update);
    document.addEventListener("visibilitychange", updateWhenVisible);
  };

  const unbind = (): void => {
    viewport.removeEventListener("resize", update);
    viewport.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    window.removeEventListener("orientationchange", update);
    window.removeEventListener("pageshow", update);
    window.removeEventListener("focus", update);
    document.removeEventListener("focusout", update);
    document.removeEventListener("visibilitychange", updateWhenVisible);
  };

  return { bind, unbind };
};
