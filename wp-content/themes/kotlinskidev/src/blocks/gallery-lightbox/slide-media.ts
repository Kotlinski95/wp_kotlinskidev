import type { initSwiper } from "@utils/carousel/initSwiper";
import { attachImageZoom } from "@utils/zoom/attachImageZoom";
import { trackEvent } from "../../scripts/track-event";
import type { GalleryLightboxSettings } from "./gallery-data";

export type LightboxSwiper = ReturnType<typeof initSwiper>;

export interface ActiveSlideMedia {
  pauseActiveVideo: () => void;
  playActiveVideoIfEnabled: () => void;
  teardownZoom: () => void;
}

const activeSlideOf = (swiper: LightboxSwiper): HTMLElement | undefined =>
  swiper.slides[swiper.activeIndex] as HTMLElement | undefined;

export function wireActiveSlideMedia(
  swiper: LightboxSwiper,
  settings: GalleryLightboxSettings
): ActiveSlideMedia {
  const pauseActiveVideo = () => {
    activeSlideOf(swiper)?.querySelector("video")?.pause();
  };

  const playActiveVideoIfEnabled = () => {
    if (!settings.videoAutoplay) {
      return;
    }
    activeSlideOf(swiper)
      ?.querySelector("video")
      ?.play()
      .catch(() => {});
  };

  let currentZoomTeardown: (() => void) | null = null;
  const attachZoomToActiveSlide = () => {
    currentZoomTeardown?.();
    const activeSlide = activeSlideOf(swiper);
    if (activeSlide && !activeSlide.classList.contains("swiper-slide--video")) {
      currentZoomTeardown = attachImageZoom(activeSlide);
    }
  };
  attachZoomToActiveSlide();
  swiper.on("slideChange", () => {
    pauseActiveVideo();
    trackEvent("lightbox_navigate", { item_index: swiper.activeIndex });
    requestAnimationFrame(() => {
      attachZoomToActiveSlide();
      playActiveVideoIfEnabled();
    });
  });

  return {
    pauseActiveVideo,
    playActiveVideoIfEnabled,
    teardownZoom: () => currentZoomTeardown?.(),
  };
}
