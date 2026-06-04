const isTouchDevice = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;

const getDistance = (touches: TouchList): number => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const attachImageZoom = (container: HTMLElement): (() => void) => {
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  let isZoomedIn = false;
  let currentScale = 1;
  let translateX = 0;
  let translateY = 0;

  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let pinchStartMidX = 0;
  let pinchStartMidY = 0;
  let pinchStartTranslateX = 0;
  let pinchStartTranslateY = 0;

  let panStartX = 0;
  let panStartY = 0;
  let panStartTranslateX = 0;
  let panStartTranslateY = 0;
  let isPanning = false;

  const img = (): HTMLElement | null => container.querySelector<HTMLElement>("img");

  const clampTranslate = () => {
    const { width: W, height: H } = container.getBoundingClientRect();
    translateX = Math.min(0, Math.max(W - W * currentScale, translateX));
    translateY = Math.min(0, Math.max(H - H * currentScale, translateY));
  };

  const applyTransform = () => {
    const el = img();
    if (!el) return;
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    el.style.transformOrigin = "0 0";
  };

  const reset = (animate = true) => {
    const el = img();
    if (!el) return;
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    isZoomedIn = false;
    isPanning = false;
    if (animate) {
      el.style.transition = "transform 0.2s ease";
      el.style.cursor = "zoom-in";
      applyTransform();
      const cleanup = () => {
        container.style.overflow = "";
        el.style.transform = "";
        el.style.transformOrigin = "";
        el.style.transition = "";
        el.removeEventListener("transitionend", cleanup);
      };
      el.addEventListener("transitionend", cleanup);
    } else {
      container.style.overflow = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.transition = "";
      el.style.cursor = "";
    }
  };

  const onImageClick = (e: MouseEvent) => {
    e.stopPropagation();
    const el = img();
    if (!el) return;
    isZoomedIn = !isZoomedIn;

    if (isZoomedIn) {
      container.style.overflow = "visible";
      currentScale = 1.75;
      const rect = el.getBoundingClientRect();
      translateX = (rect.width * (1 - currentScale)) / 2;
      translateY = (rect.height * (1 - currentScale)) / 2;
      el.style.transition = "transform 0.25s ease";
      el.style.cursor = "zoom-out";
      applyTransform();
    } else {
      reset(true);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (e.touches.length === 2) {
      isPanning = false;
      pinchStartDistance = getDistance(e.touches);
      pinchStartScale = currentScale;
      pinchStartMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      pinchStartMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      pinchStartTranslateX = translateX;
      pinchStartTranslateY = translateY;
    } else if (e.touches.length === 1 && currentScale > 1) {
      isPanning = true;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;
      panStartTranslateX = translateX;
      panStartTranslateY = translateY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const el = img();
    if (!el) return;
    el.style.transition = "none";

    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, pinchStartScale * (distance / pinchStartDistance))
      );
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = container.getBoundingClientRect();
      const originX = midX - rect.left;
      const originY = midY - rect.top;
      translateX =
        originX -
        (originX - pinchStartTranslateX) * (newScale / pinchStartScale) +
        (midX - pinchStartMidX);
      translateY =
        originY -
        (originY - pinchStartTranslateY) * (newScale / pinchStartScale) +
        (midY - pinchStartMidY);
      currentScale = newScale;
      clampTranslate();
      container.style.overflow = currentScale > MIN_SCALE ? "visible" : "";
      applyTransform();
    } else if (e.touches.length === 1 && isPanning) {
      translateX = panStartTranslateX + (e.touches[0].clientX - panStartX);
      translateY = panStartTranslateY + (e.touches[0].clientY - panStartY);
      clampTranslate();
      applyTransform();
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    e.stopImmediatePropagation();
    if (e.touches.length === 1) {
      isPanning = currentScale > 1;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;
      panStartTranslateX = translateX;
      panStartTranslateY = translateY;
    }
    if (e.touches.length === 0) {
      isPanning = false;
      if (currentScale <= 1.05) reset(true);
    }
  };

  const teardown = () => {
    reset(false);
    if (isTouchDevice()) {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    } else {
      container.removeEventListener("click", onImageClick);
    }
  };

  if (isTouchDevice()) {
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: false });
  } else {
    const el = img();
    if (el) el.style.cursor = "zoom-in";
    container.addEventListener("click", onImageClick);
  }

  return teardown;
};
