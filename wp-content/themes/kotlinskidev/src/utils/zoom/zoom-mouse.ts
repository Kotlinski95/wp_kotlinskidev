import {
  DRAG_THRESHOLD_PX,
  TAP_ZOOM_SCALE,
  rememberPanStart,
  resetZoom,
  type ZoomView,
} from "./zoom-view";

const panFromStart = (view: ZoomView, dx: number, dy: number): void => {
  view.state.translateX = view.state.panStartTranslateX + dx;
  view.state.translateY = view.state.panStartTranslateY + dy;
  view.clampTranslate();
  view.applyTransform();
};

const createDragHandlers = (view: ZoomView) => {
  const { state, img } = view;

  const onMouseMove = (e: MouseEvent): void => {
    const dx = e.clientX - state.panStartX;
    const dy = e.clientY - state.panStartY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      state.mouseDragged = true;
    }
    if (!state.mouseDragged) {
      return;
    }
    panFromStart(view, dx, dy);
  };

  const onMouseUp = (): void => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    const el = img();
    if (el && state.isZoomedIn) {
      el.style.cursor = "grab";
    }
  };

  const onMouseDown = (e: MouseEvent): void => {
    state.mouseDragged = false;
    if (!state.isZoomedIn) {
      return;
    }
    e.preventDefault();
    rememberPanStart(state, e.clientX, e.clientY);
    const el = img();
    if (el) {
      el.style.transition = "none";
      el.style.cursor = "grabbing";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { onMouseMove, onMouseUp, onMouseDown };
};

const zoomInAt = (view: ZoomView, el: HTMLElement, e: MouseEvent): void => {
  const { state } = view;
  view.container.style.overflow = "visible";
  state.currentScale = TAP_ZOOM_SCALE;
  const rect = el.getBoundingClientRect();
  state.translateX = (e.clientX - rect.left) * (1 - state.currentScale);
  state.translateY = (e.clientY - rect.top) * (1 - state.currentScale);
  view.clampTranslate();
  el.style.transition = "transform 0.25s ease";
  el.style.cursor = "grab";
  view.applyTransform();
};

const createClickHandler =
  (view: ZoomView) =>
  (e: MouseEvent): void => {
    const { state } = view;
    e.stopPropagation();
    if (state.mouseDragged) {
      return;
    }
    const el = view.img();
    if (!el) {
      return;
    }
    state.isZoomedIn = !state.isZoomedIn;
    if (state.isZoomedIn) {
      zoomInAt(view, el, e);
    } else {
      resetZoom(view, true);
    }
  };

export const createMouseHandlers = (view: ZoomView) => ({
  ...createDragHandlers(view),
  onImageClick: createClickHandler(view),
});
