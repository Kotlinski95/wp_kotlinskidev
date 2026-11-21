import { isIosWebKit, isWebKitBrowser } from "@utils/is-webkit-browser";
import {
  clearVideoPosterData,
  clearVideoSourceData,
  resolveVideoAlphaSource,
  resolveVideoPoster,
  resolveVideoSource,
} from "@utils/responsive-media";
import { attachAlphaCanvas } from "./alpha-canvas";
import type { HeroSwiper } from "./hero-swiper";
import { holdVideoUntilFirstFrame } from "./video-first-frame";

const ALPHA_VIDEO_REVEAL_FALLBACK_MS = 1000;

export const preloadSlideImages = (slide: HTMLElement): void => {
  slide.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.loading !== "lazy" || !img.src) {
      return;
    }
    img.loading = "eager";
  });
};

const watchFirstPlaying = (video: HTMLVideoElement): void => {
  video.addEventListener(
    "playing",
    () => {
      const reveal = (): void => {
        video.classList.add("is-playing");
        video.closest(".hero-carousel__bg")?.classList.add("hero-carousel__bg--playing");
      };
      const isAlpha = video.closest(".hero-carousel__bg--alpha") !== null;
      if (isAlpha && typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(reveal);
        window.setTimeout(reveal, ALPHA_VIDEO_REVEAL_FALLBACK_MS);
        return;
      }
      reveal();
    },
    { once: true }
  );
};

export const applySlidePoster = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  const poster = resolveVideoPoster(video);
  if (!poster) {
    return;
  }
  video.poster = poster;
  clearVideoPosterData(video);
};

const assignVideoSource = (slide: HTMLElement, video: HTMLVideoElement): void => {
  const alphaSrc = resolveVideoAlphaSource(video);
  if (alphaSrc && isWebKitBrowser()) {
    video.src = alphaSrc;
    delete video.dataset.src;
    if (isIosWebKit()) {
      applySlidePoster(slide);
      attachAlphaCanvas(video);
    }
    return;
  }
  const source = resolveVideoSource(video);
  if (source) {
    video.src = source;
  }
};

const prepareSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  assignVideoSource(slide, video);
  clearVideoSourceData(video);
  delete video.dataset.srcAlpha;
  watchFirstPlaying(video);
  applySlidePoster(slide);
  if (isIosWebKit() && !video.closest(".hero-carousel__bg--alpha-canvas")) {
    holdVideoUntilFirstFrame(video);
  }
};

const resetSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (video) {
    video.currentTime = 0;
  }
};

export const playSlideVideo = (slide: HTMLElement): void => {
  slide
    .querySelector<HTMLVideoElement>("video")
    ?.play()
    .catch(() => {});
};

const pauseSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  video.pause();
};

export const prepareSlideAt = (swiper: HeroSwiper, index: number): void => {
  const slide = swiper.slides[index];
  if (slide) {
    prepareSlideVideo(slide);
    preloadSlideImages(slide);
  }
};

export const wireSlideVideoLifecycle = (swiper: HeroSwiper): void => {
  swiper.on("slideChangeTransitionStart", () => {
    prepareSlideAt(swiper, swiper.activeIndex);
    prepareSlideAt(swiper, swiper.activeIndex + 1);
    const prev = swiper.slides[swiper.previousIndex];
    if (prev) {
      pauseSlideVideo(prev);
    }
  });

  swiper.on("slideChangeTransitionEnd", () => {
    const prev = swiper.slides[swiper.previousIndex];
    if (prev && prev !== swiper.slides[swiper.activeIndex]) {
      resetSlideVideo(prev);
    }
    const active = swiper.slides[swiper.activeIndex];
    if (active) {
      playSlideVideo(active);
    }
  });
};
