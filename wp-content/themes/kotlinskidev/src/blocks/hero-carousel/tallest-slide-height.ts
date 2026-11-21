import { SCROLL_CONTAINER_CHANGE_EVENT } from "../../scripts/app-shell";
import type { HeroSwiper } from "./hero-swiper";

const RESIZE_DEBOUNCE_MS = 150;

const debounce = (fn: () => void, delay: number): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

const syncTallestSlideHeight = (el: HTMLElement, swiper: HeroSwiper): void => {
  el.style.minHeight = "";

  const tallest = swiper.slides
    .filter((slide) => !slide.classList.contains("swiper-slide-duplicate"))
    .reduce((max, slide) => {
      const content = slide.querySelector<HTMLElement>(".hero-carousel__content");
      return Math.max(max, content?.scrollHeight ?? 0);
    }, 0);

  if (tallest > 0) {
    el.style.minHeight = `${tallest}px`;
  }

  swiper.update();
};

export const wireTallestSlideHeightSync = (el: HTMLElement, swiper: HeroSwiper): void => {
  requestAnimationFrame(() => {
    const previousHeight = el.offsetHeight;
    syncTallestSlideHeight(el, swiper);
    if (el.offsetHeight !== previousHeight) {
      window.dispatchEvent(new Event(SCROLL_CONTAINER_CHANGE_EVENT));
    }
  });
  window.addEventListener(
    "resize",
    debounce(() => syncTallestSlideHeight(el, swiper), RESIZE_DEBOUNCE_MS)
  );
};
