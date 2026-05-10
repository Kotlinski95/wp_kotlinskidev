import { attachImageZoom } from "@utils/zoom/attachImageZoom";

(() => {
  const isTouchDevice = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  let currentZoomTeardown: (() => void) | null = null;

  const blockOverlayClickHandler = (e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest(".close-button") && !target.closest(".lightbox-image-container")) {
      e.stopImmediatePropagation();
    }
  };

  const setupLightbox = (overlay: HTMLElement) => {
    overlay.addEventListener("click", blockOverlayClickHandler, true);
    if (isTouchDevice()) overlay.style.touchAction = "none";

    const containers = overlay.querySelectorAll<HTMLElement>(".lightbox-image-container");
    const thumbnailContainer = containers[0];
    const enlargedContainer = containers[1];

    if (thumbnailContainer) thumbnailContainer.style.display = "none";
    if (enlargedContainer) currentZoomTeardown = attachImageZoom(enlargedContainer);
  };

  const teardownLightbox = (overlay: HTMLElement) => {
    overlay.removeEventListener("click", blockOverlayClickHandler, true);
    overlay.style.touchAction = "";

    currentZoomTeardown?.();
    currentZoomTeardown = null;

    const containers = overlay.querySelectorAll<HTMLElement>(".lightbox-image-container");
    if (containers[0]) containers[0].style.display = "";
  };

  const initLightbox = () => {
    const lightboxOverlay = document.querySelector<HTMLElement>(".wp-lightbox-overlay");
    if (!lightboxOverlay) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const overlay = mutation.target as HTMLElement;
        if (overlay.classList.contains("active")) {
          setupLightbox(overlay);
        } else {
          teardownLightbox(overlay);
        }
      });
    });

    observer.observe(lightboxOverlay, { attributes: true, attributeFilter: ["class"] });

    if (lightboxOverlay.classList.contains("active")) {
      setupLightbox(lightboxOverlay);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLightbox);
  } else {
    initLightbox();
  }
})();
