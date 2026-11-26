import { attachImageZoom } from "@utils/zoom/attachImageZoom";
import { trackEvent } from "../track-event";
import {
  applyContext,
  clearContext,
  forgetPendingContext,
  takePendingContext,
} from "./source-context";

const IMAGE_CONTAINER_SELECTOR = ".lightbox-image-container";
const PASS_THROUGH_SELECTORS = [
  ".wp-lightbox-close-button",
  ".close-button",
  IMAGE_CONTAINER_SELECTOR,
];
const TEARDOWN_FALLBACK_MS = 500;

let currentZoomTeardown: (() => void) | null = null;

const isTouchDevice = (): boolean =>
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

const blockOverlayClickHandler = (e: MouseEvent): void => {
  const target = e.target as Element;
  if (!PASS_THROUGH_SELECTORS.some((selector) => target.closest(selector))) {
    e.stopImmediatePropagation();
  }
};

export const setupLightbox = (overlay: HTMLElement): void => {
  overlay.addEventListener("click", blockOverlayClickHandler, true);
  if (isTouchDevice()) {
    overlay.style.touchAction = "none";
  }

  const containers = overlay.querySelectorAll<HTMLElement>(IMAGE_CONTAINER_SELECTOR);
  const thumbnailContainer = containers[0];
  const enlargedContainer = containers[1];

  if (thumbnailContainer) {
    thumbnailContainer.style.display = "none";
  }
  if (enlargedContainer) {
    currentZoomTeardown = attachImageZoom(enlargedContainer);
    const pendingContext = takePendingContext();
    if (pendingContext) {
      applyContext(overlay, pendingContext, enlargedContainer);
    }
  }

  forgetPendingContext();
  trackEvent("lightbox_open", {
    item_name: enlargedContainer?.querySelector("img")?.alt ?? "",
  });
};

export const teardownLightbox = (overlay: HTMLElement): void => {
  overlay.removeEventListener("click", blockOverlayClickHandler, true);
  overlay.style.touchAction = "";

  currentZoomTeardown?.();
  currentZoomTeardown = null;

  const containers = overlay.querySelectorAll<HTMLElement>(IMAGE_CONTAINER_SELECTOR);
  if (containers[0]) {
    containers[0].style.display = "";
  }

  const onDone = () => {
    clearTimeout(fallback);
    overlay.removeEventListener("transitionend", onTransitionEnd);
    clearContext(overlay);
  };
  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.target !== overlay) {
      return;
    }
    onDone();
  };
  const fallback = setTimeout(onDone, TEARDOWN_FALLBACK_MS);
  overlay.addEventListener("transitionend", onTransitionEnd);
};
