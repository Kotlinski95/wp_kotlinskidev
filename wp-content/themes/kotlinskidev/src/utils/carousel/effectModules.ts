import type { SwiperModule } from "swiper/types";
import type { CarouselSettings } from "./types";

type TransitionEffect = CarouselSettings["transitionEffect"];

const EFFECT_LOADERS: Record<Exclude<TransitionEffect, "slide">, () => Promise<SwiperModule>> = {
  fade: () => import("swiper/modules").then(({ EffectFade }) => EffectFade),
  cube: () => import("swiper/modules").then(({ EffectCube }) => EffectCube),
  coverflow: () => import("swiper/modules").then(({ EffectCoverflow }) => EffectCoverflow),
  flip: () => import("swiper/modules").then(({ EffectFlip }) => EffectFlip),
  cards: () => import("swiper/modules").then(({ EffectCards }) => EffectCards),
};

export const loadEffectModules = async (
  effect: TransitionEffect | undefined
): Promise<SwiperModule[]> => {
  if (!effect || effect === "slide" || !(effect in EFFECT_LOADERS)) {
    return [];
  }
  return [await EFFECT_LOADERS[effect]()];
};
