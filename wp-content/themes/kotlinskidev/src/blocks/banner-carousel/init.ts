import "@utils/webpack-public-path";
import type Swiper from "swiper";
import { buildSwiperConfig } from "@utils/carousel/buildConfig";
import type { CarouselSettings } from "@utils/carousel/types";

type SwiperConfig = ReturnType<typeof buildSwiperConfig>;

interface NavigationElements {
  navContainer: HTMLElement | null;
  prevEl: HTMLElement | null;
  nextEl: HTMLElement | null;
}

const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};

const importSwiperRuntime = () =>
  Promise.all([
    import("swiper"),
    import("@utils/carousel/bannerSwiperModules"),
    import("@utils/carousel/loadSwiperStyles"),
  ]);

const findNavigationElements = (el: HTMLElement): NavigationElements => {
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

  return { navContainer, prevEl, nextEl };
};

const bindNavigationElements = (config: SwiperConfig, { prevEl, nextEl }: NavigationElements) => {
  if (prevEl && nextEl && config.navigation) {
    config.navigation = {
      ...(config.navigation as object),
      prevEl,
      nextEl,
    } as typeof config.navigation;
  }
};

const formatSlideNumber = (value: number): string => String(value).padStart(2, "0");

const wireSlideCounter = (el: HTMLElement, swiper: Swiper, navContainer: HTMLElement | null) => {
  const counterEl = navContainer?.querySelector<HTMLElement>(".carousel-nav__counter") ?? null;
  if (!counterEl) {
    return;
  }
  const total = el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;
  const currentSpan = document.createElement("span");
  currentSpan.className = "carousel-nav__current";
  counterEl.textContent = "";
  counterEl.append(currentSpan, ` / ${formatSlideNumber(total)}`);
  const updateCounter = () => {
    const current = (swiper.realIndex ?? 0) + 1;
    currentSpan.textContent = formatSlideNumber(current);
  };
  updateCounter();
  swiper.on("slideChange", updateCounter);
};

export const initBannerCarousel = async (el: HTMLElement): Promise<Swiper> => {
  const settings = parseSettings(el);
  const [{ default: Swiper }, modules, { loadSwiperStyles }] = await importSwiperRuntime();
  const {
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
  } = modules;
  await loadSwiperStyles(settings);
  const config = buildSwiperConfig(settings);

  const navigationElements = findNavigationElements(el);
  bindNavigationElements(config, navigationElements);

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

  wireSlideCounter(el, swiper, navigationElements.navContainer);

  el.style.visibility = "visible";

  return swiper;
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>("[data-carousel-settings]").forEach((el) => {
    void initBannerCarousel(el);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
