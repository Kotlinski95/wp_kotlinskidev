import Swiper from "swiper";
import {
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
  A11y,
  HashNavigation,
  Mousewheel,
  Parallax,
  Scrollbar,
  Thumbs,
  Zoom,
  FreeMode,
} from "swiper/modules";

export interface SliderOptions {
  autoplay?: boolean;
  autoplayTime?: number;
  smoothTransition?: boolean;
  continuousAutoplay?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  showProgress?: boolean;
  slidesPerView?: number | "auto";
  slidesPerMobile?: number | "auto";
  slidesPerTablet?: number | "auto";
  slidesPerDesktop?: number | "auto";
  scrollbar?: boolean;
  loop?: boolean;
  mousewheel?: boolean;
  keyboard?: boolean;
  spaceBetween?: number;
  grabCursor?: boolean;
  simulateTouch?: boolean;
  centerSlides?: boolean;
  draggable?: boolean;
}

export function SwiperInit(container: HTMLElement, options: SliderOptions = {}): Swiper {
  const slideCount = container.querySelectorAll(":scope > .swiper-wrapper > .swiper-slide").length;
  const centerSlides = options.centerSlides ?? false;
  const slidesPerView = options.slidesPerView || 1;
  const loopThreshold = typeof slidesPerView === "number" ? slidesPerView : 1;
  const canLoop = centerSlides ? slideCount > 2 : slideCount > loopThreshold * 2;
  const continuousAutoplay = Boolean(options.continuousAutoplay);
  const draggable = options.draggable ?? true;

  const parameters: Record<string, unknown> = {
    centeredSlides: centerSlides,
    createElements: true,
    grabCursor: draggable && (options.grabCursor ?? true),
    initialSlide: 0,
    modules: [
      Autoplay,
      Keyboard,
      Navigation,
      Pagination,
      A11y,
      HashNavigation,
      Mousewheel,
      Parallax,
      Scrollbar,
      Thumbs,
      Zoom,
      FreeMode,
    ],
    navigation: options.navigation ?? false,
    simulateTouch: draggable && (options.simulateTouch ?? true),
    loop: (options.loop ?? true) && canLoop,
    autoplay: buildAutoplayParams(options, continuousAutoplay),
    slidesPerView: centerSlides ? "auto" : options.slidesPerView || 1,
    spaceBetween: typeof options.spaceBetween === "number" ? options.spaceBetween : 16,
    breakpoints: centerSlides
      ? undefined
      : {
          640: { slidesPerView: options.slidesPerMobile || 1 },
          768: { slidesPerView: options.slidesPerTablet || 1 },
          1024: { slidesPerView: options.slidesPerDesktop || 1 },
        },
    zoom: { maxRatio: 5 },
    parallax: true,
    mousewheel: options.mousewheel ?? false,
    keyboard: options.keyboard ?? { enabled: true, onlyInViewport: true },
    lazy: {
      loadPrevNext: true,
      loadPrevNextAmount: 3,
      loadOnTransitionStart: true,
    },
    speed: computeSpeed(options, continuousAutoplay),
    allowTouchMove: draggable,
    resistanceRatio: 0.85,
    ...(continuousAutoplay && {
      freeMode: { enabled: true, momentum: false, sticky: false },
    }),
    ...(options.smoothTransition &&
      !continuousAutoplay &&
      draggable && {
        cssMode: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        followFinger: true,
        shortSwipes: true,
        longSwipes: true,
      }),
  };
  let paginationElement: HTMLElement | null = null;
  if (!options.scrollbar && options.pagination) {
    paginationElement = container.querySelector<HTMLElement>(":scope > .swiper-pagination");
    if (paginationElement) {
      parameters.pagination = { el: paginationElement, clickable: false };
    }
  }

  if (options.scrollbar && !options.pagination) {
    parameters.scrollbar = true;
  }

  const swiper = new Swiper(container, parameters);

  if (parameters.pagination) {
    resyncPaginationOnFullLoad(swiper);
  }

  if (paginationElement) {
    wirePaginationClicks(paginationElement, swiper, Boolean(parameters.loop));
  }

  if (options.smoothTransition || continuousAutoplay) {
    const swiperWrapper = container.querySelector<HTMLElement>(".swiper-wrapper");
    if (swiperWrapper) {
      swiperWrapper.style.transitionTimingFunction = "linear";
    }
  }

  if (options.autoplay && continuousAutoplay) {
    wireContinuousAutoplay(container, swiper, computeSpeed(options, continuousAutoplay));
  } else if (options.autoplay) {
    resyncActiveIndexOnAutoplayResume(swiper);
    wireClickPauseResume(container, swiper);
    wireProgressCircle(container, swiper);
  }

  return swiper;
}

function wirePaginationClicks(paginationElement: HTMLElement, swiper: Swiper, loop: boolean): void {
  paginationElement.addEventListener("click", (event) => {
    const bulletEl = (event.target as HTMLElement).closest<HTMLElement>(
      ".swiper-pagination-bullet"
    );
    if (!bulletEl || bulletEl.parentElement !== paginationElement) {
      return;
    }
    const index = Array.from(paginationElement.children).indexOf(bulletEl);
    if (index < 0) {
      return;
    }
    if (loop) {
      swiper.slideToLoop(index);
    } else {
      swiper.slideTo(index);
    }
  });
}

function resyncPaginationOnFullLoad(swiper: Swiper): void {
  const resync = () => {
    if (swiper.destroyed) {
      return;
    }
    swiper.update();
    swiper.pagination?.render();
    swiper.pagination?.update();
  };

  if (document.readyState === "complete") {
    requestAnimationFrame(resync);
    return;
  }

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(resync);
    },
    { once: true }
  );
}

function computeSpeed(options: SliderOptions, continuousAutoplay: boolean): number {
  if (continuousAutoplay) {
    return (options.autoplayTime || 20) * 1000;
  }
  return options.smoothTransition ? 800 : 300;
}

function buildAutoplayParams(
  options: SliderOptions,
  continuousAutoplay: boolean
): Record<string, unknown> | boolean {
  if (continuousAutoplay) {
    return {
      enabled: false,
      delay: 1,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    };
  }

  if (options.autoplay && options.autoplayTime) {
    return {
      delay: (options.autoplayTime || 1) * 1000,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    };
  }

  return options.autoplay ?? true;
}

function wireClickPauseResume(container: HTMLElement, swiper: Swiper): void {
  let userInteracted = false;

  const pause = () => {
    userInteracted = true;
    swiper.autoplay.pause();
  };

  const resume = (event?: Event) => {
    if (!event || (event && !container.contains(event.target as Node) && userInteracted)) {
      userInteracted = false;
      swiper.autoplay.resume();
    }
  };

  container.addEventListener("click", () => {
    pause();
  });

  container.addEventListener("mouseover", () => {
    pause();
  });

  container.addEventListener("mouseout", () => {
    resume();
  });

  document.addEventListener("click", (event) => {
    resume(event);
  });
}

interface SwiperWithTranslateControl {
  wrapperEl: HTMLElement;
  animating: boolean;
  snapGrid: number[];
  setTransition: (duration: number) => void;
  setTranslate: (translate: number) => void;
}

function getCurrentTranslateX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") {
    return 0;
  }
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) {
    return 0;
  }
  const parts = match[1].split(",").map((value) => parseFloat(value.trim()));
  return parts[4] ?? 0;
}

function freezeAtCurrentPosition(swiper: Swiper): number {
  const controllable = swiper as unknown as SwiperWithTranslateControl;
  if (!controllable.wrapperEl) {
    return 0;
  }
  const currentTranslateX = getCurrentTranslateX(controllable.wrapperEl);
  controllable.setTransition(0);
  controllable.setTranslate(currentTranslateX);
  controllable.animating = false;
  return currentTranslateX;
}

function computeResumeSpeed(
  swiper: Swiper,
  targetIndex: number,
  frozenTranslateX: number,
  fullSpeed: number
): number {
  const grid = (swiper as unknown as SwiperWithTranslateControl).snapGrid;
  const targetTranslateX = grid?.[targetIndex];
  const stepDistance = Math.abs((grid?.[1] ?? 0) - (grid?.[0] ?? 0));
  if (typeof targetTranslateX !== "number" || !stepDistance) {
    return fullSpeed;
  }
  const remainingDistance = Math.abs(-targetTranslateX - frozenTranslateX);
  const ratio = Math.min(remainingDistance / stepDistance, 1);
  return Math.max(fullSpeed * ratio, 50);
}

function wireContinuousAutoplay(container: HTMLElement, swiper: Swiper, speed: number): void {
  resyncActiveIndexOnAutoplayResume(swiper);

  let hovered = false;
  let focused = false;
  let clicked = false;
  let isPaused = false;
  let resumeMidTransition = false;
  let resumeTargetIndex = -1;
  let resumeFrozenTranslateX = 0;

  const evaluate = () => {
    const shouldPause = hovered || focused || clicked;
    if (shouldPause === isPaused) {
      return;
    }
    isPaused = shouldPause;
    if (shouldPause) {
      const controllable = swiper as unknown as SwiperWithTranslateControl;
      resumeMidTransition = controllable.animating;
      resumeFrozenTranslateX = freezeAtCurrentPosition(swiper);
      resumeTargetIndex = swiper.activeIndex;
      swiper.autoplay.pause();
    } else if (resumeMidTransition) {
      const remainingSpeed = computeResumeSpeed(
        swiper,
        resumeTargetIndex,
        resumeFrozenTranslateX,
        speed
      );
      swiper.slideTo(resumeTargetIndex, remainingSpeed, true, true);
    } else {
      swiper.slideNext(speed, true, true);
    }
  };

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

  container.addEventListener("mousedown", () => {
    clicked = true;
    evaluate();
  });

  document.addEventListener("click", (event) => {
    if (clicked && !container.contains(event.target as Node)) {
      clicked = false;
      evaluate();
    }
  });

  if (typeof IntersectionObserver === "undefined") {
    swiper.autoplay.start();
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      swiper.autoplay.start();
      obs.unobserve(entry.target);
    });
  });
  observer.observe(container);
}

function wireProgressCircle(container: HTMLElement, swiper: Swiper): void {
  const progressCircle = container.querySelector<SVGCircleElement>(
    ":scope > .swiper-progress .swiper-progress-fill"
  );
  if (!progressCircle) {
    return;
  }

  const radius = parseFloat(progressCircle.getAttribute("r") || "16");
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `${circumference}`;

  swiper.on(
    "autoplayTimeLeft",
    (_swiperInstance: Swiper, _timeLeft: number, percentage: number) => {
      progressCircle.style.strokeDashoffset = `${circumference * percentage}`;
    }
  );
}

interface SwiperWithActiveIndexSync {
  updateActiveIndex: () => void;
}

function resyncActiveIndexOnAutoplayResume(swiper: Swiper): void {
  const syncableSwiper = swiper as unknown as SwiperWithActiveIndexSync;
  const resync = () => syncableSwiper.updateActiveIndex();

  swiper.on("autoplayStart", resync);
  swiper.on("autoplayResume", resync);
}
