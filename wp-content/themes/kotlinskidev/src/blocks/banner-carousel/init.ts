import "swiper/swiper-bundle.css";
import Swiper from "swiper";
import {
  Navigation,
  Pagination,
  Keyboard,
  Autoplay,
  Scrollbar,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
} from "swiper/modules";
import { buildSwiperConfig } from "@utils/carousel/buildConfig";
import type { CarouselSettings } from "@utils/carousel/types";

const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};

export const initBannerCarousel = (el: HTMLElement): Swiper => {
  const settings = parseSettings(el);
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
    config.navigation = {
      ...(config.navigation as object),
      prevEl,
      nextEl,
    } as typeof config.navigation;
  }

  el.style.visibility = "hidden";

  const swiper = new Swiper(el, {
    modules: [
      Navigation,
      Pagination,
      Keyboard,
      Autoplay,
      Scrollbar,
      EffectFade,
      EffectCube,
      EffectCoverflow,
      EffectFlip,
      EffectCards,
    ],
    ...config,
  });

  const counterEl = navContainer?.querySelector<HTMLElement>(".carousel-nav__counter") ?? null;
  if (counterEl) {
    const total = el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;
    const currentSpan = document.createElement("span");
    currentSpan.className = "carousel-nav__current";
    counterEl.textContent = "";
    counterEl.append(currentSpan, ` / ${String(total).padStart(2, "0")}`);
    const updateCounter = () => {
      const current = (swiper.realIndex ?? 0) + 1;
      currentSpan.textContent = String(current).padStart(2, "0");
    };
    updateCounter();
    swiper.on("slideChange", updateCounter);
  }

  el.style.visibility = "visible";

  return swiper;
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>("[data-carousel-settings]").forEach(initBannerCarousel);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
