import type { initSwiper as InitSwiper } from "@utils/carousel/initSwiper";
import type { CarouselSettings } from "@utils/carousel/types";

export type HeroSwiper = ReturnType<typeof InitSwiper>;

export const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};
