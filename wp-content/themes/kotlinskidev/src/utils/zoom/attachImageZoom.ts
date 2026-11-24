import { createMouseHandlers } from "./zoom-mouse";
import { createTouchHandlers } from "./zoom-touch";
import { createZoomView, isTouchDevice, resetZoom } from "./zoom-view";

export const attachImageZoom = (container: HTMLElement): (() => void) => {
  const view = createZoomView(container);
  const mouse = createMouseHandlers(view);
  const touch = createTouchHandlers(view);

  const teardown = (): void => {
    resetZoom(view, false);
    document.removeEventListener("mousemove", mouse.onMouseMove);
    document.removeEventListener("mouseup", mouse.onMouseUp);
    if (isTouchDevice()) {
      container.removeEventListener("touchstart", touch.onTouchStart);
      container.removeEventListener("touchmove", touch.onTouchMove);
      container.removeEventListener("touchend", touch.onTouchEnd);
    } else {
      container.removeEventListener("mousedown", mouse.onMouseDown);
      container.removeEventListener("click", mouse.onImageClick);
    }
  };

  if (isTouchDevice()) {
    container.addEventListener("touchstart", touch.onTouchStart, { passive: false });
    container.addEventListener("touchmove", touch.onTouchMove, { passive: false });
    container.addEventListener("touchend", touch.onTouchEnd, { passive: false });
  } else {
    const el = view.img();
    if (el) {
      el.style.cursor = "zoom-in";
    }
    container.addEventListener("mousedown", mouse.onMouseDown);
    container.addEventListener("click", mouse.onImageClick);
  }

  return teardown;
};
