export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
export const TAP_ZOOM_SCALE = 1.75;
export const SNAP_BACK_SCALE = 1.05;
export const DRAG_THRESHOLD_PX = 4;

export interface ZoomState {
  isZoomedIn: boolean;
  currentScale: number;
  translateX: number;
  translateY: number;
  pinchStartDistance: number;
  pinchStartScale: number;
  pinchStartMidX: number;
  pinchStartMidY: number;
  pinchStartTranslateX: number;
  pinchStartTranslateY: number;
  panStartX: number;
  panStartY: number;
  panStartTranslateX: number;
  panStartTranslateY: number;
  isPanning: boolean;
  mouseDragged: boolean;
}

export interface ZoomView {
  state: ZoomState;
  container: HTMLElement;
  img: () => HTMLElement | null;
  clampTranslate: () => void;
  applyTransform: () => void;
}

export const isTouchDevice = (): boolean =>
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

export const getDistance = (touches: TouchList): number => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const createZoomState = (): ZoomState => ({
  isZoomedIn: false,
  currentScale: 1,
  translateX: 0,
  translateY: 0,
  pinchStartDistance: 0,
  pinchStartScale: 1,
  pinchStartMidX: 0,
  pinchStartMidY: 0,
  pinchStartTranslateX: 0,
  pinchStartTranslateY: 0,
  panStartX: 0,
  panStartY: 0,
  panStartTranslateX: 0,
  panStartTranslateY: 0,
  isPanning: false,
  mouseDragged: false,
});

const clearImageStyles = (container: HTMLElement, el: HTMLElement): void => {
  container.style.overflow = "";
  el.style.transform = "";
  el.style.transformOrigin = "";
  el.style.transition = "";
};

const animateReset = (view: ZoomView, el: HTMLElement): void => {
  el.style.transition = "transform 0.2s ease";
  el.style.cursor = "zoom-in";
  view.applyTransform();
  const cleanup = (): void => {
    clearImageStyles(view.container, el);
    el.removeEventListener("transitionend", cleanup);
  };
  el.addEventListener("transitionend", cleanup);
};

export const createZoomView = (container: HTMLElement): ZoomView => {
  const state = createZoomState();
  const img = (): HTMLElement | null => container.querySelector<HTMLElement>("img");

  const clampTranslate = (): void => {
    const { width, height } = container.getBoundingClientRect();
    state.translateX = Math.min(0, Math.max(width - width * state.currentScale, state.translateX));
    state.translateY = Math.min(
      0,
      Math.max(height - height * state.currentScale, state.translateY)
    );
  };

  const applyTransform = (): void => {
    const el = img();
    if (!el) {
      return;
    }
    el.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.currentScale})`;
    el.style.transformOrigin = "0 0";
  };

  return { state, container, img, clampTranslate, applyTransform };
};

export const rememberPanStart = (state: ZoomState, x: number, y: number): void => {
  state.panStartX = x;
  state.panStartY = y;
  state.panStartTranslateX = state.translateX;
  state.panStartTranslateY = state.translateY;
};

export const resetZoom = (view: ZoomView, animate = true): void => {
  const { state, container } = view;
  const el = view.img();
  if (!el) {
    return;
  }
  state.currentScale = 1;
  state.translateX = 0;
  state.translateY = 0;
  state.isZoomedIn = false;
  state.isPanning = false;
  if (animate) {
    animateReset(view, el);
    return;
  }
  clearImageStyles(container, el);
  el.style.cursor = "";
};
