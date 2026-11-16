import type { CarouselSettings } from "./types";

type StyleLoader = () => Promise<unknown>;

const EFFECT_STYLES: Record<Exclude<CarouselSettings["transitionEffect"], "slide">, StyleLoader> = {
  fade: () => import("swiper/css/effect-fade"),
  cube: () => import("swiper/css/effect-cube"),
  coverflow: () => import("swiper/css/effect-coverflow"),
  flip: () => import("swiper/css/effect-flip"),
  cards: () => import("swiper/css/effect-cards"),
};

export const loadSwiperStyles = async (settings: Partial<CarouselSettings>): Promise<void> => {
  const { transitionEffect = "slide", showScrollbar = false } = settings;
  const loaders: StyleLoader[] = [
    () => import("swiper/css"),
    () => import("swiper/css/navigation"),
    () => import("swiper/css/pagination"),
  ];

  if (showScrollbar) {
    loaders.push(() => import("swiper/css/scrollbar"));
  }
  if (transitionEffect !== "slide" && EFFECT_STYLES[transitionEffect]) {
    loaders.push(EFFECT_STYLES[transitionEffect]);
  }

  await Promise.all(loaders.map((load) => load()));
};
