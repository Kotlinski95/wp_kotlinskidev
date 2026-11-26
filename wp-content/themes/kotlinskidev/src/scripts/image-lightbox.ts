import { setupLightbox, teardownLightbox } from "./image-lightbox/overlay-lifecycle";
import { forgetPendingContext, rememberPendingContext } from "./image-lightbox/source-context";
import { labelLightboxTriggers } from "./image-lightbox/trigger-labels";

const OVERLAY_SELECTOR = ".wp-lightbox-overlay";
const IMAGE_FIGURE_SELECTOR = ".wp-block-image";
const ACTIVE_CLASS = "active";

const syncOverlayState = (overlay: HTMLElement): void => {
  if (overlay.classList.contains(ACTIVE_CLASS)) {
    setupLightbox(overlay);
  } else {
    teardownLightbox(overlay);
  }
};

const initLightbox = (): void => {
  const lightboxOverlay = document.querySelector<HTMLElement>(OVERLAY_SELECTOR);
  if (!lightboxOverlay) {
    return;
  }

  document.addEventListener("pointerdown", () => forgetPendingContext(), true);

  document.querySelectorAll<HTMLElement>(IMAGE_FIGURE_SELECTOR).forEach((figure) => {
    figure.addEventListener("click", () => rememberPendingContext(figure));
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => syncOverlayState(mutation.target as HTMLElement));
  });

  observer.observe(lightboxOverlay, { attributes: true, attributeFilter: ["class"] });

  if (lightboxOverlay.classList.contains(ACTIVE_CLASS)) {
    setupLightbox(lightboxOverlay);
  }
};

const init = (): void => {
  initLightbox();
  labelLightboxTriggers();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
