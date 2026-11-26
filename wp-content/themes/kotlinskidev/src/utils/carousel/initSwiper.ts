import Swiper from "swiper";
import { Navigation, Pagination, Keyboard, Autoplay } from "swiper/modules";
import type { SwiperModule } from "swiper/types";
import { buildSwiperConfig } from "./buildConfig";
import type { CarouselSettings } from "./types";

export interface InitSwiperOptions {
  initialSlide?: number;
  forceLoop?: boolean;
  slideCount?: number;
  onSlideChange?: (index: number) => void;
  disableNativeHoverPause?: boolean;
  effectModules?: SwiperModule[];
}

type SwiperConfig = Record<string, unknown>;

interface NavElements {
  navContainer: HTMLElement | null;
  prevEl: HTMLElement | null;
  nextEl: HTMLElement | null;
}

const findNavElements = (el: HTMLElement): NavElements => {
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

const scopeSelectorToContainer = (
  config: SwiperConfig,
  el: HTMLElement,
  key: "pagination" | "scrollbar"
): void => {
  const current = config[key];
  if (!current || typeof current !== "object") {
    return;
  }
  const selector = (current as { el?: unknown }).el;
  if (typeof selector !== "string") {
    return;
  }
  const scoped =
    el.querySelector<HTMLElement>(selector) ??
    el.parentElement?.querySelector<HTMLElement>(selector) ??
    null;
  config[key] = scoped ? { ...current, el: scoped } : false;
};

interface ScopeOptions {
  nav: NavElements;
  disableNativeHoverPause: boolean | undefined;
}

const scopeConfigToContainer = (
  config: SwiperConfig,
  el: HTMLElement,
  { nav: { prevEl, nextEl }, disableNativeHoverPause }: ScopeOptions
): void => {
  if (disableNativeHoverPause && config.autoplay) {
    config.autoplay = { ...(config.autoplay as object), pauseOnMouseEnter: false };
  }
  if (prevEl && nextEl && config.navigation) {
    config.navigation = { ...(config.navigation as object), prevEl, nextEl };
  }
  scopeSelectorToContainer(config, el, "pagination");
  scopeSelectorToContainer(config, el, "scrollbar");
};

interface CounterOptions {
  counterEl: HTMLElement | null;
  total: number;
  onSlideChange: ((index: number) => void) | undefined;
}

const bindCounter = (swiper: Swiper, { counterEl, total, onSlideChange }: CounterOptions): void => {
  if (!counterEl && !onSlideChange) {
    return;
  }
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
};

const buildOverrides = ({
  initialSlide,
  forceLoop,
}: Pick<InitSwiperOptions, "initialSlide" | "forceLoop">): Record<string, unknown> => {
  const overrides: Record<string, unknown> = {};
  if (initialSlide !== undefined) {
    overrides.initialSlide = initialSlide;
  }
  if (forceLoop !== undefined) {
    overrides.loop = forceLoop;
  }
  return overrides;
};

export const initSwiper = (
  el: HTMLElement,
  settings: Partial<CarouselSettings>,
  options: InitSwiperOptions = {}
): Swiper => {
  const { slideCount, onSlideChange, disableNativeHoverPause, effectModules = [] } = options;
  const config: SwiperConfig = buildSwiperConfig(settings);
  const nav = findNavElements(el);
  scopeConfigToContainer(config, el, { nav, disableNativeHoverPause });

  const swiper = new Swiper(el, {
    modules: [Navigation, Pagination, Keyboard, Autoplay, ...effectModules],
    ...config,
    ...buildOverrides(options),
  } as ConstructorParameters<typeof Swiper>[1]);

  const counterEl = nav.navContainer?.querySelector<HTMLElement>(".carousel-nav__counter") ?? null;
  const total =
    slideCount ?? el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;

  if (total <= 1) {
    nav.prevEl?.setAttribute("disabled", "");
    nav.nextEl?.setAttribute("disabled", "");
  }

  bindCounter(swiper, { counterEl, total, onSlideChange });

  return swiper;
};
