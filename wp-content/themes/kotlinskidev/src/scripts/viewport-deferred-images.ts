import { loadDeferredImage } from "@utils/load-deferred-images";

const NEAR_VIEWPORT_MARGIN = "200px";
const SELECTOR = ".kt-content-tabs__panel img[data-src]";

const initViewportDeferredImages = (): void => {
  const images = document.querySelectorAll<HTMLImageElement>(SELECTOR);
  if (!images.length) {
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    images.forEach(loadDeferredImage);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        loadDeferredImage(entry.target as HTMLImageElement);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: NEAR_VIEWPORT_MARGIN }
  );

  images.forEach((img) => observer.observe(img));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initViewportDeferredImages);
} else {
  initViewportDeferredImages();
}
