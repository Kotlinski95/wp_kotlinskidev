import {
  MAX_SCALE,
  MIN_SCALE,
  SNAP_BACK_SCALE,
  getDistance,
  rememberPanStart,
  resetZoom,
  type ZoomState,
  type ZoomView,
} from "./zoom-view";

const midpoint = (touches: TouchList): { x: number; y: number } => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2,
});

const applyPinch = (view: ZoomView, touches: TouchList): void => {
  const { state, container } = view;
  const distance = getDistance(touches);
  const newScale = Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, state.pinchStartScale * (distance / state.pinchStartDistance))
  );
  const { x: midX, y: midY } = midpoint(touches);
  const rect = container.getBoundingClientRect();
  const originX = midX - rect.left;
  const originY = midY - rect.top;
  state.translateX =
    originX -
    (originX - state.pinchStartTranslateX) * (newScale / state.pinchStartScale) +
    (midX - state.pinchStartMidX);
  state.translateY =
    originY -
    (originY - state.pinchStartTranslateY) * (newScale / state.pinchStartScale) +
    (midY - state.pinchStartMidY);
  state.currentScale = newScale;
  view.clampTranslate();
  container.style.overflow = state.currentScale > MIN_SCALE ? "visible" : "";
  view.applyTransform();
};

const startPinch = (state: ZoomState, touches: TouchList): void => {
  state.isPanning = false;
  state.pinchStartDistance = getDistance(touches);
  state.pinchStartScale = state.currentScale;
  const { x, y } = midpoint(touches);
  state.pinchStartMidX = x;
  state.pinchStartMidY = y;
  state.pinchStartTranslateX = state.translateX;
  state.pinchStartTranslateY = state.translateY;
};

const handleTouchStart = (state: ZoomState, e: TouchEvent): void => {
  e.preventDefault();
  e.stopImmediatePropagation();

  if (e.touches.length === 2) {
    startPinch(state, e.touches);
  } else if (e.touches.length === 1 && state.currentScale > 1) {
    state.isPanning = true;
    rememberPanStart(state, e.touches[0].clientX, e.touches[0].clientY);
  }
};

const handleTouchMove = (view: ZoomView, e: TouchEvent): void => {
  const { state } = view;
  e.preventDefault();
  e.stopImmediatePropagation();
  const el = view.img();
  if (!el) {
    return;
  }
  el.style.transition = "none";

  if (e.touches.length === 2) {
    applyPinch(view, e.touches);
  } else if (e.touches.length === 1 && state.isPanning) {
    state.translateX = state.panStartTranslateX + (e.touches[0].clientX - state.panStartX);
    state.translateY = state.panStartTranslateY + (e.touches[0].clientY - state.panStartY);
    view.clampTranslate();
    view.applyTransform();
  }
};

const handleTouchEnd = (view: ZoomView, e: TouchEvent): void => {
  const { state } = view;
  e.stopImmediatePropagation();
  if (e.touches.length === 1) {
    state.isPanning = state.currentScale > 1;
    rememberPanStart(state, e.touches[0].clientX, e.touches[0].clientY);
  }
  if (e.touches.length === 0) {
    state.isPanning = false;
    if (state.currentScale <= SNAP_BACK_SCALE) {
      resetZoom(view, true);
    }
  }
};

export const createTouchHandlers = (view: ZoomView) => ({
  onTouchStart: (e: TouchEvent): void => handleTouchStart(view.state, e),
  onTouchMove: (e: TouchEvent): void => handleTouchMove(view, e),
  onTouchEnd: (e: TouchEvent): void => handleTouchEnd(view, e),
});
