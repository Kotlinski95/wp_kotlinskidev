(() => {
  let initialDistance = 0;
  let currentScale = 1;
  let baseScale = 1;
  let isPinching = false;

  const getDistance = (touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (touches: TouchList, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
      y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
    };
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;

    isPinching = true;
    initialDistance = getDistance(e.touches);
    baseScale = currentScale;

    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector<HTMLElement>('img');
    if (!img) return;

    const mid = getMidpoint(e.touches, container);
    img.style.transformOrigin = `${mid.x}px ${mid.y}px`;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || !isPinching) return;

    e.stopPropagation();

    const distance = getDistance(e.touches);
    currentScale = Math.min(Math.max(baseScale * (distance / initialDistance), 1), 4);

    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector<HTMLElement>('img');
    if (!img) return;

    img.style.transform = `scale(${currentScale})`;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length >= 2) return;

    isPinching = false;

    if (currentScale <= 1.05) {
      currentScale = 1;
      const container = e.currentTarget as HTMLElement;
      const img = container.querySelector<HTMLElement>('img');
      if (img) {
        img.style.transform = '';
        img.style.transformOrigin = '';
      }
    }
  };

  const attachZoom = (overlay: Element) => {
    overlay.querySelectorAll<HTMLElement>('.lightbox-image-container').forEach((container) => {
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: false });
      container.addEventListener('touchend', onTouchEnd, { passive: true });
    });
  };

  const detachZoom = (overlay: Element) => {
    overlay.querySelectorAll<HTMLElement>('.lightbox-image-container').forEach((container) => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);

      const img = container.querySelector<HTMLElement>('img');
      if (img) {
        img.style.transform = '';
        img.style.transformOrigin = '';
      }
    });

    currentScale = 1;
    baseScale = 1;
    isPinching = false;
  };

  const initLightboxZoom = () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const overlay = mutation.target as Element;
        if (overlay.classList.contains('active')) {
          attachZoom(overlay);
        } else {
          detachZoom(overlay);
        }
      });
    });

    const lightboxOverlay = document.querySelector('.wp-lightbox-overlay');
    if (!lightboxOverlay) return;

    observer.observe(lightboxOverlay, { attributes: true, attributeFilter: ['class'] });

    if (lightboxOverlay.classList.contains('active')) {
      attachZoom(lightboxOverlay);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightboxZoom);
  } else {
    initLightboxZoom();
  }
})();

