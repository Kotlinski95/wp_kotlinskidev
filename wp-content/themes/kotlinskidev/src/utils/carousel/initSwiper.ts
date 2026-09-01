import Swiper from "swiper";
import {
  Navigation,
  Pagination,
  Keyboard,
  Autoplay,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
} from "swiper/modules";
import { buildSwiperConfig } from "./buildConfig";
import type { CarouselSettings } from "./types";

export interface InitSwiperOptions {
  initialSlide?: number;
  forceLoop?: boolean;
  slideCount?: number;
  onSlideChange?: (index: number) => void;
}

export const initSwiper = (
  el: HTMLElement,
  settings: Partial<CarouselSettings>,
  options: InitSwiperOptions = {}
): Swiper => {
  const { initialSlide, forceLoop, slideCount, onSlideChange } = options;
  const config = buildSwiperConfig(settings);

  const navContainer =
    el.querySelector<HTMLElement>(".carousel-nav") ??
    el.parentElement?.querySelector<HTMLElement>(".carousel-nav") ??
    null;

  const prevEl =
    navContainer?.querySelector<HTMLElement>(".swiper-button-prev") ??
    el.querySelector<HTMLElement>(".swiper-button-prev") ??
    null;

  const nextEl =
    navContainer?.querySelector<HTMLElement>(".swiper-button-next") ??
    el.querySelector<HTMLElement>(".swiper-button-next") ??
    null;

  if (prevEl && nextEl && config.navigation) {
    (config as Record<string, unknown>).navigation = {
      ...(config.navigation as object),
      prevEl,
      nextEl,
    };
  }

  const overrides: Record<string, unknown> = {};
  if (initialSlide !== undefined) {
    overrides.initialSlide = initialSlide;
  }
  if (forceLoop !== undefined) {
    overrides.loop = forceLoop;
  }

  const swiper = new Swiper(el, {
    modules: [
      Navigation,
      Pagination,
      Keyboard,
      Autoplay,
      EffectFade,
      EffectCube,
      EffectCoverflow,
      EffectFlip,
      EffectCards,
    ],
    ...config,
    ...overrides,
  } as ConstructorParameters<typeof Swiper>[1]);

  const counterEl = navContainer?.querySelector<HTMLElement>(".carousel-nav__counter") ?? null;
  const total =
    slideCount ?? el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;

  if (total <= 1) {
    prevEl?.setAttribute("disabled", "");
    nextEl?.setAttribute("disabled", "");
  }

  if (counterEl || onSlideChange) {
    let currentSpan: HTMLSpanElement | null = null;
    if (counterEl) {
      currentSpan = document.createElement("span");
      currentSpan.className = "carousel-nav__current";
      counterEl.textContent = "";
      counterEl.append(currentSpan, ` / ${String(total).padStart(2, "0")}`);
    }
    const updateCounter = () => {
      const index = swiper.realIndex ?? 0;
      if (currentSpan) {
        currentSpan.textContent = String(index + 1).padStart(2, "0");
      }
      onSlideChange?.(index);
    };
    updateCounter();
    swiper.on("slideChange", updateCounter);
  }

  return swiper;
};
