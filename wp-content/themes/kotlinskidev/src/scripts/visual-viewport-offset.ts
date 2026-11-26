import { initMobileOnly } from "./utils";
import { clearBottomOffset } from "./visual-viewport-offset/bottom-offset";
import { createOffsetUpdater } from "./visual-viewport-offset/offset-updater";
import { createViewportListeners } from "./visual-viewport-offset/viewport-listeners";

const initVisualViewportOffset = (): void => {
  const viewport = window.visualViewport;
  if (!viewport) {
    return;
  }

  const { update, cancelPendingUpdate } = createOffsetUpdater(viewport);
  const listeners = createViewportListeners(viewport, update);

  const enable = (): void => {
    update();
    listeners.bind();
  };

  const disable = (): void => {
    cancelPendingUpdate();
    listeners.unbind();
    clearBottomOffset();
  };

  initMobileOnly(enable, disable);
};

initVisualViewportOffset();
