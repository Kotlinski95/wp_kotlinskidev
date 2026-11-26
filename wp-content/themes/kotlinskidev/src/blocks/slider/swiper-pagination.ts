import type Swiper from "swiper";
import type { SliderOptions } from "./slider-options";
import type { SwiperParameters } from "./swiper-parameters";

export function attachPaginationParameters(
  container: HTMLElement,
  options: SliderOptions,
  parameters: SwiperParameters
): HTMLElement | null {
  let paginationElement: HTMLElement | null = null;
  if (!options.scrollbar && options.pagination) {
    paginationElement = container.querySelector<HTMLElement>(":scope > .swiper-pagination");
    if (paginationElement) {
      parameters.pagination = { el: paginationElement, clickable: false };
    }
  }

  if (options.scrollbar && !options.pagination) {
    parameters.scrollbar = true;
  }

  return paginationElement;
}

export function wirePaginationClicks(
  paginationElement: HTMLElement,
  swiper: Swiper,
  loop: boolean
): void {
  paginationElement.addEventListener("click", (event) => {
    const bulletEl = (event.target as HTMLElement).closest<HTMLElement>(
      ".swiper-pagination-bullet"
    );
    if (!bulletEl || bulletEl.parentElement !== paginationElement) {
      return;
    }
    const index = Array.from(paginationElement.children).indexOf(bulletEl);
    if (index < 0) {
      return;
    }
    if (loop) {
      swiper.slideToLoop(index);
    } else {
      swiper.slideTo(index);
    }
  });
}

export function resyncPaginationOnFullLoad(swiper: Swiper): void {
  const resync = () => {
    if (swiper.destroyed) {
      return;
    }
    swiper.update();
    swiper.pagination?.render();
    swiper.pagination?.update();
  };

  if (document.readyState === "complete") {
    requestAnimationFrame(resync);
    return;
  }

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(resync);
    },
    { once: true }
  );
}
