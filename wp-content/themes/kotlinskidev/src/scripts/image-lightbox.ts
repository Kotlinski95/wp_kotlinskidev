(() => {
  const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  let isZoomedIn = false;
  let currentScale = 1;
  let translateX = 0;
  let translateY = 0;
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

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

  const clampTranslate = (container: HTMLElement) => {
    const { width: W, height: H } = container.getBoundingClientRect();
    const maxX = 0;
    const minX = W - W * currentScale;
    const maxY = 0;
    const minY = H - H * currentScale;
    translateX = Math.min(maxX, Math.max(minX, translateX));
    translateY = Math.min(maxY, Math.max(minY, translateY));
  };

  const applyTransform = (img: HTMLElement) => {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    img.style.transformOrigin = '0 0';
  };

  const blockOverlayClickHandler = (e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest('.close-button') && !target.closest('.lightbox-image-container')) {
      e.stopImmediatePropagation();
    }
  };

  const onImageClick = (e: MouseEvent) => {
    e.stopPropagation();
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector<HTMLElement>('img');
    if (!img) return;

    isZoomedIn = !isZoomedIn;

    if (isZoomedIn) {
      container.style.overflow = 'visible';
      currentScale = 1.75;
      const rect = img.getBoundingClientRect();
      translateX = rect.width * (1 - currentScale) / 2;
      translateY = rect.height * (1 - currentScale) / 2;
      img.style.transition = 'transform 0.25s ease';
      img.style.cursor = 'zoom-out';
      applyTransform(img);
    } else {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      img.style.transition = 'transform 0.25s ease';
      img.style.cursor = 'zoom-in';
      applyTransform(img);
      const cleanup = () => {
        container.style.overflow = '';
        img.style.transform = '';
        img.style.transformOrigin = '';
        img.style.transition = '';
        img.removeEventListener('transitionend', cleanup);
      };
      img.addEventListener('transitionend', cleanup);
    }
  };

  const blockContainerClick = (e: MouseEvent) => e.stopPropagation();

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
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

    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector<HTMLElement>('img');
    if (!img) return;

    img.style.transition = 'none';

    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStartScale * (distance / pinchStartDistance)));

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const rect = container.getBoundingClientRect();
      const originX = midX - rect.left;
      const originY = midY - rect.top;

      translateX = originX - (originX - pinchStartTranslateX) * (newScale / pinchStartScale) + (midX - pinchStartMidX);
      translateY = originY - (originY - pinchStartTranslateY) * (newScale / pinchStartScale) + (midY - pinchStartMidY);
      currentScale = newScale;
      clampTranslate(container);

      container.style.overflow = currentScale > MIN_SCALE ? 'visible' : '';
      applyTransform(img);
    } else if (e.touches.length === 1 && isPanning) {
      translateX = panStartTranslateX + (e.touches[0].clientX - panStartX);
      translateY = panStartTranslateY + (e.touches[0].clientY - panStartY);
      clampTranslate(container);
      applyTransform(img);
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

      if (currentScale <= 1.05) {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        const container = e.currentTarget as HTMLElement;
        const img = container.querySelector<HTMLElement>('img');
        if (img) {
          img.style.transition = 'transform 0.2s ease';
          img.style.transform = '';
          img.style.transformOrigin = '';
          container.style.overflow = '';
        }
      }
    }
  };

  const setupLightbox = (overlay: HTMLElement) => {
    overlay.addEventListener('click', blockOverlayClickHandler, true);

    const containers = overlay.querySelectorAll<HTMLElement>('.lightbox-image-container');
    const thumbnailContainer = containers[0];
    const enlargedContainer = containers[1];

    if (thumbnailContainer) thumbnailContainer.style.display = 'none';

    if (isTouchDevice()) {
      overlay.style.touchAction = 'none';
      if (enlargedContainer) {
        enlargedContainer.addEventListener('click', blockContainerClick);
        enlargedContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        enlargedContainer.addEventListener('touchmove', onTouchMove, { passive: false });
        enlargedContainer.addEventListener('touchend', onTouchEnd, { passive: false });
      }
    } else if (enlargedContainer) {
      const img = enlargedContainer.querySelector<HTMLElement>('img');
      if (img) img.style.cursor = 'zoom-in';
      enlargedContainer.addEventListener('click', onImageClick);
    }
  };

  const teardownLightbox = (overlay: HTMLElement) => {
    overlay.removeEventListener('click', blockOverlayClickHandler, true);
    overlay.style.touchAction = '';

    const containers = overlay.querySelectorAll<HTMLElement>('.lightbox-image-container');
    const thumbnailContainer = containers[0];
    const enlargedContainer = containers[1];

    if (thumbnailContainer) thumbnailContainer.style.display = '';

    if (enlargedContainer) {
      enlargedContainer.style.overflow = '';
      enlargedContainer.removeEventListener('click', onImageClick);
      enlargedContainer.removeEventListener('click', blockContainerClick);
      enlargedContainer.removeEventListener('touchstart', onTouchStart);
      enlargedContainer.removeEventListener('touchmove', onTouchMove);
      enlargedContainer.removeEventListener('touchend', onTouchEnd);

      const img = enlargedContainer.querySelector<HTMLElement>('img');
      if (img) {
        img.style.transform = '';
        img.style.transformOrigin = '';
        img.style.transition = '';
        img.style.cursor = '';
      }
    }

    isZoomedIn = false;
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    isPanning = false;
  };

  const initLightbox = () => {
    const lightboxOverlay = document.querySelector<HTMLElement>('.wp-lightbox-overlay');
    if (!lightboxOverlay) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const overlay = mutation.target as HTMLElement;
        if (overlay.classList.contains('active')) {
          setupLightbox(overlay);
        } else {
          teardownLightbox(overlay);
        }
      });
    });

    observer.observe(lightboxOverlay, { attributes: true, attributeFilter: ['class'] });

    if (lightboxOverlay.classList.contains('active')) {
      setupLightbox(lightboxOverlay);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();

