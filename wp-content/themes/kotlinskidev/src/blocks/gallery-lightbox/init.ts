import "@utils/webpack-public-path";
import { isMobileViewport, parseImages, parseSettings } from "./gallery-data";
import { openModal } from "./lightbox-modal";
import { syncInitialTrigger, syncTriggerToItem } from "./trigger-sync";

export const initGalleryLightbox = (gallery: HTMLElement): void => {
  const images = parseImages(gallery);
  if (!images.length) {
    return;
  }

  const trigger = gallery.querySelector<HTMLElement>(".gallery-lightbox-trigger");
  if (!trigger) {
    return;
  }

  const settings = parseSettings(gallery);
  let activeIndex = 0;

  const onSlideChange = (index: number): void => {
    activeIndex = index;
    syncTriggerToItem({ trigger, images, settings }, index);
  };

  if (gallery.dataset.mobileImages && isMobileViewport()) {
    syncInitialTrigger(trigger, images, settings);
  }

  trigger.addEventListener("click", () =>
    openModal({
      images,
      startIndex: activeIndex,
      trigger,
      settings,
      onSlideChange: settings.trackActiveSlide ? onSlideChange : undefined,
    })
  );
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>("[data-gallery-lightbox]").forEach(initGalleryLightbox);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
