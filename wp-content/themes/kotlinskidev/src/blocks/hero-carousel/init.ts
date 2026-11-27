import "@utils/webpack-public-path";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import type { initSwiper as InitSwiper } from "@utils/carousel/initSwiper";
import { loadEffectModules } from "@utils/carousel/effectModules";
import { pauseAutoplayOnMotionStop } from "@utils/carousel/pauseOnMotionStop";
import type { CarouselSettings } from "@utils/carousel/types";
import { wireAutoplayHoverPause } from "./autoplay-hover-pause";
import { whenInteractedOrIdle, whenPageSettled, yieldToMain } from "./deferred-start";
import { parseSettings, type HeroSwiper } from "./hero-swiper";
import {
  capturePendingNavigation,
  replayNavigation,
  type PendingNavigation,
} from "./pending-navigation";
import {
  applySlidePoster,
  playSlideVideo,
  prepareSlideAt,
  preloadSlideImages,
  wireSlideVideoLifecycle,
} from "./slide-video";
import { wireTallestSlideHeightSync } from "./tallest-slide-height";

const EAGER_ROOT_MARGIN = "200px 0px";
const LAZY_ROOT_MARGIN = "0px";

interface SwiperMountRequest {
  el: HTMLElement;
  initSwiper: typeof InitSwiper;
  settings: Partial<CarouselSettings>;
  effectModules: Awaited<ReturnType<typeof loadEffectModules>>;
}

const mountSwiper = ({
  el,
  initSwiper,
  settings,
  effectModules,
}: SwiperMountRequest): HeroSwiper => {
  el.style.visibility = "hidden";
  const swiper = initSwiper(el, settings, { disableNativeHoverPause: true, effectModules });
  el.style.visibility = "visible";
  return swiper;
};

const warmUpInitialSlides = (swiper: HeroSwiper): void => {
  const firstSlide = swiper.slides[swiper.activeIndex];
  const startIndex = swiper.activeIndex;
  const nextSlide = swiper.slides[startIndex + 1];
  prepareSlideAt(swiper, startIndex);
  if (nextSlide) {
    applySlidePoster(nextSlide);
    preloadSlideImages(nextSlide);
  }
  whenPageSettled(() => {
    if (firstSlide) {
      playSlideVideo(firstSlide);
    }
  });
};

const initHeroCarousel = async (
  el: HTMLElement,
  initSwiper: typeof InitSwiper,
  pending: PendingNavigation
): Promise<void> => {
  const settings = parseSettings(el);
  const effectModules = await loadEffectModules(settings.transitionEffect);
  const swiper = mountSwiper({ el, initSwiper, settings, effectModules });
  pending.stop();
  pauseAutoplayOnMotionStop(swiper);

  wireSlideVideoLifecycle(swiper);
  replayNavigation(swiper, pending.actions);
  wireAutoplayHoverPause(el, swiper);

  await yieldToMain();

  if (settings.autoHeight !== true) {
    wireTallestSlideHeightSync(el, swiper);
  }

  await yieldToMain();

  warmUpInitialSlides(swiper);
};

const observeUntilVisible = (el: HTMLElement): void => {
  const pending = capturePendingNavigation(el);
  const rootMargin = parseSettings(el).lazyLoad ? LAZY_ROOT_MARGIN : EAGER_ROOT_MARGIN;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const target = entry.target as HTMLElement;
        obs.unobserve(target);
        whenInteractedOrIdle(() => {
          void import("@utils/carousel/initSwiper")
            .then(({ initSwiper }) => initHeroCarousel(target, initSwiper, pending))
            .catch(() => pending.stop());
        });
      });
    },
    { rootMargin }
  );
  observer.observe(el);
};

const init = (): void => {
  document
    .querySelectorAll<HTMLElement>(".hero-carousel__swiper[data-carousel-settings]")
    .forEach(observeUntilVisible);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
