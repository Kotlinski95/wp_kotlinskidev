import { loadDeferredImage } from "@utils/load-deferred-images";

const NEAR_VIEWPORT_MARGIN = "200px";
const DEFERRED_IMAGE_SELECTOR = ".kt-content-tabs__panel img[data-src]";

const initViewportDeferredImages = (): void => {
  const images = document.querySelectorAll<HTMLImageElement>(DEFERRED_IMAGE_SELECTOR);
  if (!images.length) {
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    images.forEach(loadDeferredImage);
    return;
  }

  const deferredImageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        loadDeferredImage(entry.target as HTMLImageElement);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: NEAR_VIEWPORT_MARGIN }
  );

  images.forEach((img) => deferredImageObserver.observe(img));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initViewportDeferredImages);
} else {
  initViewportDeferredImages();
}
