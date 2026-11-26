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
import type { CarouselSettings } from "@utils/carousel/types";
import { isIosWebKit, isWebKitBrowser } from "@utils/is-webkit-browser";
import { attachAlphaCanvas } from "./alpha-canvas";
import { holdVideoUntilFirstFrame } from "./video-first-frame";
import { SCROLL_CONTAINER_CHANGE_EVENT } from "../../scripts/app-shell";
import { onScroll } from "../../scripts/utils";
import {
  clearVideoPosterData,
  clearVideoSourceData,
  resolveVideoAlphaSource,
  resolveVideoPoster,
  resolveVideoSource,
} from "@utils/responsive-media";

const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};

const preloadSlideImages = (slide: HTMLElement): void => {
  slide.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.loading !== "lazy" || !img.src) {
      return;
    }
    img.loading = "eager";
  });
};

const watchFirstPlaying = (video: HTMLVideoElement): void => {
  video.addEventListener(
    "playing",
    () => {
      const reveal = (): void => {
        video.classList.add("is-playing");
        video.closest(".hero-carousel__bg")?.classList.add("hero-carousel__bg--playing");
      };
      const isAlpha = video.closest(".hero-carousel__bg--alpha") !== null;
      if (isAlpha && typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(reveal);
        window.setTimeout(reveal, 1000);
        return;
      }
      reveal();
    },
    { once: true }
  );
};

const prepareSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  const alphaSrc = resolveVideoAlphaSource(video);
  if (alphaSrc && isWebKitBrowser()) {
    video.src = alphaSrc;
    delete video.dataset.src;
    if (isIosWebKit()) {
      applySlidePoster(slide);
      attachAlphaCanvas(video);
    }
  } else {
    const source = resolveVideoSource(video);
    if (source) {
      video.src = source;
    }
  }
  clearVideoSourceData(video);
  delete video.dataset.srcAlpha;
  watchFirstPlaying(video);
  applySlidePoster(slide);
  if (isIosWebKit() && !video.closest(".hero-carousel__bg--alpha-canvas")) {
    holdVideoUntilFirstFrame(video);
  }
};

const applySlidePoster = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  const poster = resolveVideoPoster(video);
  if (!poster) {
    return;
  }
  video.poster = poster;
  clearVideoPosterData(video);
};

const resetSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (video) {
    video.currentTime = 0;
  }
};

const playSlideVideo = (slide: HTMLElement): void => {
  slide
    .querySelector<HTMLVideoElement>("video")
    ?.play()
    .catch(() => {});
};

const pauseSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  video.pause();
};

const isConsentDialogOpen = (): boolean =>
  document.documentElement.classList.contains("kt-cmplz-pending") ||
  document.querySelector(".cmplz-soft-cookiewall:not(.cmplz-dismissed)") !== null;

const wireAutoplayHoverPause = (el: HTMLElement, swiper: ReturnType<typeof InitSwiper>): void => {
  const container = el.closest<HTMLElement>(".hero-carousel") ?? el;
  let hovered = container.matches(":hover");
  let focused = false;
  let pressed = false;

  const evaluate = () => {
    if (hovered || focused || pressed || isConsentDialogOpen()) {
      swiper.autoplay.pause();
    } else {
      swiper.autoplay.resume();
    }
  };

  swiper.on("autoplayResume", () => {
    if (hovered || focused || pressed || isConsentDialogOpen()) {
      swiper.autoplay.pause();
    }
  });

  container.addEventListener("mouseenter", () => {
    hovered = true;
    evaluate();
  });

  container.addEventListener("mouseleave", () => {
    hovered = false;
    evaluate();
  });

  container.addEventListener("focusin", () => {
    focused = true;
    evaluate();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && container.contains(nextFocusedElement)) {
      return;
    }
    focused = false;
    evaluate();
  });

  container.addEventListener("pointerdown", () => {
    pressed = true;
    evaluate();
  });

  const releasePress = (event: Event) => {
    if (!pressed) {
      return;
    }
    pressed = false;
    const pointerEvent = event as PointerEvent;
    if (!pointerEvent.pointerType || pointerEvent.pointerType === "mouse") {
      const rect = container.getBoundingClientRect();
      hovered =
        pointerEvent.clientX >= rect.left &&
        pointerEvent.clientX <= rect.right &&
        pointerEvent.clientY >= rect.top &&
        pointerEvent.clientY <= rect.bottom;
    }
    evaluate();
  };
  const evaluateWhileConnected = () => {
    if (container.isConnected) {
      evaluate();
    }
  };
  const evaluateNextFrame = () => window.requestAnimationFrame(evaluateWhileConnected);
  document.addEventListener("cmplz_status_change", evaluateNextFrame);
  document.addEventListener("cmplz_cookie_warning_loaded", evaluateNextFrame);
  document.addEventListener("kt-cmplz-released", evaluateWhileConnected);
  if (isConsentDialogOpen()) {
    evaluate();
  }
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);
};

const syncTallestSlideHeight = (el: HTMLElement, swiper: ReturnType<typeof InitSwiper>): void => {
  el.style.minHeight = "";

  const tallest = swiper.slides
    .filter((slide) => !slide.classList.contains("swiper-slide-duplicate"))
    .reduce((max, slide) => {
      const content = slide.querySelector<HTMLElement>(".hero-carousel__content");
      return Math.max(max, content?.scrollHeight ?? 0);
    }, 0);

  if (tallest > 0) {
    el.style.minHeight = `${tallest}px`;
  }

  swiper.update();
};

const debounce = (fn: () => void, delay: number): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

const VIDEO_START_IDLE_TIMEOUT_MS = 300;
const VIDEO_START_FALLBACK_MS = 100;

const whenPageSettled = (callback: () => void): void => {
  const afterLoad = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, { timeout: VIDEO_START_IDLE_TIMEOUT_MS });
    } else {
      setTimeout(callback, VIDEO_START_FALLBACK_MS);
    }
  };
  if (document.readyState === "complete") {
    afterLoad();
  } else {
    window.addEventListener("load", afterLoad, { once: true });
  }
};

type NavigationAction = "prev" | "next" | number;

interface PendingNavigation {
  actions: NavigationAction[];
  stop: () => void;
}

const resolveNavigationAction = (target: Element): NavigationAction | null => {
  if (target.closest(".swiper-button-prev")) {
    return "prev";
  }
  if (target.closest(".swiper-button-next")) {
    return "next";
  }
  const bullet = target.closest(".swiper-pagination-bullet");
  if (bullet?.parentElement) {
    return Array.prototype.indexOf.call(bullet.parentElement.children, bullet);
  }
  return null;
};

const capturePendingNavigation = (el: HTMLElement): PendingNavigation => {
  const container = el.closest<HTMLElement>(".hero-carousel") ?? el;
  const actions: NavigationAction[] = [];
  const onClick = (event: Event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const action = resolveNavigationAction(event.target);
    if (action !== null) {
      actions.push(action);
    }
  };
  container.addEventListener("click", onClick);
  return { actions, stop: () => container.removeEventListener("click", onClick) };
};

const replayNavigation = (
  swiper: ReturnType<typeof InitSwiper>,
  actions: NavigationAction[]
): void => {
  actions.forEach((action) => {
    if (action === "prev") {
      swiper.slidePrev();
    } else if (action === "next") {
      swiper.slideNext();
    } else {
      swiper.slideTo(action);
    }
  });
};

const LATE_INIT_TIMEOUT_MS = 1200;
const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

const whenInteractedOrIdle = (callback: () => void): void => {
  let done = false;
  const cleanups: Array<() => void> = [];

  const run = () => {
    if (done) {
      return;
    }
    done = true;
    cleanups.forEach((cleanup) => cleanup());
    callback();
  };

  FIRST_INTERACTION_EVENTS.forEach((type) => {
    window.addEventListener(type, run, { once: true, passive: true });
    cleanups.push(() => window.removeEventListener(type, run));
  });
  cleanups.push(onScroll(run));

  const scheduleIdle = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: LATE_INIT_TIMEOUT_MS });
    } else {
      const timer = setTimeout(run, LATE_INIT_TIMEOUT_MS);
      cleanups.push(() => clearTimeout(timer));
    }
  };

  if (document.readyState === "complete") {
    scheduleIdle();
  } else {
    window.addEventListener("load", scheduleIdle, { once: true });
    cleanups.push(() => window.removeEventListener("load", scheduleIdle));
  }
};

const yieldToMain = (): Promise<void> => {
  const scheduler = (window as unknown as { scheduler?: { yield?: () => Promise<void> } })
    .scheduler;
  if (typeof scheduler?.yield === "function") {
    return scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
};

const initHeroCarousel = async (
  el: HTMLElement,
  initSwiper: typeof InitSwiper,
  pending: PendingNavigation
): Promise<void> => {
  const settings = parseSettings(el);
  const effectModules = await loadEffectModules(settings.transitionEffect);
  el.style.visibility = "hidden";
  const swiper = initSwiper(el, settings, { disableNativeHoverPause: true, effectModules });
  el.style.visibility = "visible";
  pending.stop();

  const prepareSlideAt = (index: number): void => {
    const slide = swiper.slides[index];
    if (slide) {
      prepareSlideVideo(slide);
      preloadSlideImages(slide);
    }
  };

  swiper.on("slideChangeTransitionStart", () => {
    prepareSlideAt(swiper.activeIndex);
    prepareSlideAt(swiper.activeIndex + 1);
    const prev = swiper.slides[swiper.previousIndex];
    if (prev) {
      pauseSlideVideo(prev);
    }
  });

  swiper.on("slideChangeTransitionEnd", () => {
    const prev = swiper.slides[swiper.previousIndex];
    if (prev && prev !== swiper.slides[swiper.activeIndex]) {
      resetSlideVideo(prev);
    }
    const active = swiper.slides[swiper.activeIndex];
    if (active) {
      playSlideVideo(active);
    }
  });

  replayNavigation(swiper, pending.actions);
  wireAutoplayHoverPause(el, swiper);

  await yieldToMain();

  if (settings.autoHeight !== true) {
    requestAnimationFrame(() => {
      const previousHeight = el.offsetHeight;
      syncTallestSlideHeight(el, swiper);
      if (el.offsetHeight !== previousHeight) {
        window.dispatchEvent(new Event(SCROLL_CONTAINER_CHANGE_EVENT));
      }
    });
    window.addEventListener(
      "resize",
      debounce(() => syncTallestSlideHeight(el, swiper), 150)
    );
  }

  await yieldToMain();

  const firstSlide = swiper.slides[swiper.activeIndex];
  const startIndex = swiper.activeIndex;
  const nextSlide = swiper.slides[startIndex + 1];
  prepareSlideAt(startIndex);
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

const init = (): void => {
  document
    .querySelectorAll<HTMLElement>(".hero-carousel__swiper[data-carousel-settings]")
    .forEach((el) => {
      const pending = capturePendingNavigation(el);
      const rootMargin = parseSettings(el).lazyLoad ? "0px" : "200px 0px";
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
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
