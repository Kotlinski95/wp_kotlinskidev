import Swiper from "swiper";
import type { SliderOptions } from "./slider-options";
import {
  resyncActiveIndexOnAutoplayResume,
  wireClickPauseResume,
  wireProgressCircle,
} from "./swiper-autoplay";
import { pauseAutoplayOnMotionStop } from "@utils/carousel/pauseOnMotionStop";
import { wireContinuousAutoplay } from "./swiper-continuous-autoplay";
import { buildSwiperParameters, computeSpeed } from "./swiper-parameters";
import {
  attachPaginationParameters,
  resyncPaginationOnFullLoad,
  wirePaginationClicks,
} from "./swiper-pagination";

export type { SliderOptions } from "./slider-options";

const countSlides = (container: HTMLElement): number =>
  container.querySelectorAll(":scope > .swiper-wrapper > .swiper-slide").length;

function forceLinearWrapperTiming(container: HTMLElement): void {
  const swiperWrapper = container.querySelector<HTMLElement>(".swiper-wrapper");
  if (swiperWrapper) {
    swiperWrapper.style.transitionTimingFunction = "linear";
  }
}

function wireAutoplay(container: HTMLElement, swiper: Swiper, options: SliderOptions): void {
  const continuousAutoplay = Boolean(options.continuousAutoplay);
  if (options.autoplay && continuousAutoplay) {
    const reverse = options.direction === "reverse";
    wireContinuousAutoplay(container, swiper, {
      speed: computeSpeed(options, continuousAutoplay),
      reverse,
    });
  } else if (options.autoplay) {
    resyncActiveIndexOnAutoplayResume(swiper);
    wireClickPauseResume(container, swiper);
    wireProgressCircle(container, swiper);
    pauseAutoplayOnMotionStop(swiper);
  }
}

export function SwiperInit(container: HTMLElement, options: SliderOptions = {}): Swiper {
  const parameters = buildSwiperParameters(options, countSlides(container));
  const paginationElement = attachPaginationParameters(container, options, parameters);

  const swiper = new Swiper(container, parameters);

  if (parameters.pagination) {
    resyncPaginationOnFullLoad(swiper);
  }

  if (paginationElement) {
    wirePaginationClicks(paginationElement, swiper, Boolean(parameters.loop));
  }

  if (options.smoothTransition || options.continuousAutoplay) {
    forceLinearWrapperTiming(container);
  }

  wireAutoplay(container, swiper, options);

  return swiper;
}
