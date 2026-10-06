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
  direction?: "normal" | "reverse";
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
  const reverse = options.direction === "reverse";
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
    wireContinuousAutoplay(container, swiper, computeSpeed(options, continuousAutoplay), reverse);
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
  // WebKit (Safari/iOS) reports translate3d() as matrix3d() with x at index 12, not 4 — missing this snapped the carousel back to its start on release.
  const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3d) {
    const parts = matrix3d[1].split(",").map((value) => parseFloat(value.trim()));
    return parts[12] ?? 0;
  }
  const matrix2d = transform.match(/matrix\(([^)]+)\)/);
  if (!matrix2d) {
    return 0;
  }
  const parts = matrix2d[1].split(",").map((value) => parseFloat(value.trim()));
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

// isEnd/isBeginning can go permanently (or just transiently) true under continuousAutoplay + loop — only trust a real slideNext()/slidePrev() failure (=== false, loopFix() doesn't help), then wrap to the nearest matching position rather than index 0, which caused a highly visible full-track reverse every crossing.
function findNearestSnapIndex(swiper: Swiper, translateX: number): number {
  const grid = (swiper as unknown as SwiperWithTranslateControl).snapGrid;
  if (!grid?.length) {
    return 0;
  }
  const target = -translateX;
  let closestIndex = -1;
  let closestDistance = Infinity;
  grid.forEach((position, index) => {
    if (index === swiper.activeIndex) {
      return;
    }
    const distance = Math.abs(position - target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex === -1 ? 0 : closestIndex;
}

function advance(swiper: Swiper, speed: number, reverse: boolean): boolean {
  const moved = reverse ? swiper.slidePrev(speed, true, true) : swiper.slideNext(speed, true, true);
  if (moved !== false) {
    return moved;
  }
  const controllable = swiper as unknown as SwiperWithTranslateControl;
  const currentTranslateX = controllable.wrapperEl
    ? getCurrentTranslateX(controllable.wrapperEl)
    : 0;
  swiper.slideTo(findNearestSnapIndex(swiper, currentTranslateX), 0, true, true);
  return reverse ? swiper.slidePrev(speed, true, true) : swiper.slideNext(speed, true, true);
}

interface CatchUpTarget {
  translateX: number;
  duration: number;
}

function computeCatchUpToIndex(
  swiper: Swiper,
  targetIndex: number,
  frozenTranslateX: number,
  fullSpeed: number
): CatchUpTarget | null {
  const grid = (swiper as unknown as SwiperWithTranslateControl).snapGrid;
  const targetTranslateX = grid?.[targetIndex];
  const stepDistance = Math.abs((grid?.[1] ?? 0) - (grid?.[0] ?? 0));
  if (typeof targetTranslateX !== "number" || !stepDistance) {
    return null;
  }
  const remainingDistance = Math.abs(-targetTranslateX - frozenTranslateX);
  const ratio = Math.min(remainingDistance / stepDistance, 1);
  return { translateX: -targetTranslateX, duration: Math.max(fullSpeed * ratio, 50) };
}

function computeCatchUpToNextBoundary(
  swiper: Swiper,
  frozenTranslateX: number,
  fullSpeed: number,
  reverse: boolean
): CatchUpTarget | null {
  const grid = (swiper as unknown as SwiperWithTranslateControl).snapGrid;
  const stepDistance = Math.abs((grid?.[1] ?? 0) - (grid?.[0] ?? 0));
  if (!grid?.length || !stepDistance) {
    return null;
  }
  const traveled = Math.abs(frozenTranslateX);
  const nextBoundary = reverse
    ? ([...grid].reverse().find((position) => position < traveled) ??
      Math.max(traveled - stepDistance, 0))
    : (grid.find((position) => position > traveled) ?? traveled + stepDistance);
  const remainingDistance = Math.abs(nextBoundary - traveled);
  const ratio = Math.min(Math.max(remainingDistance / stepDistance, 0), 1);
  return { translateX: -nextBoundary, duration: Math.max(fullSpeed * ratio, 50) };
}

// Animates the raw translate directly rather than slideTo()/slideNext() with a short duration, which can trip a visible one-frame reindex jump near a grid line — the real slideNext() only fires once this finishes.
function resumeWithCatchUp(
  swiper: Swiper,
  target: CatchUpTarget,
  fullSpeed: number,
  reverse: boolean
): void {
  const controllable = swiper as unknown as SwiperWithTranslateControl;
  const wrapperEl = controllable.wrapperEl;
  if (!wrapperEl) {
    advance(swiper, fullSpeed, reverse);
    return;
  }
  controllable.setTransition(target.duration);
  controllable.setTranslate(target.translateX);
  controllable.animating = true;
  const onCatchUpEnd = (event: Event) => {
    if (event.target !== wrapperEl) {
      return;
    }
    wrapperEl.removeEventListener("transitionend", onCatchUpEnd);
    if (swiper.destroyed) {
      return;
    }
    advance(swiper, fullSpeed, reverse);
  };
  wrapperEl.addEventListener("transitionend", onCatchUpEnd);
}

// Fixed, speed-independent grace period: lastProgressAt only starts once translate is already motionless, so waiting out a full `speed` again (the old formula) produced a multi-second visible freeze at every loop-boundary snap.
const STALL_GRACE_MS = 300;
const STALL_CHECK_INTERVAL_MS = 100;

// FreeMode drives its own translate/transition state outside Swiper's normal slide-transition machinery, so `animating`/`autoplay.paused` can get stuck true forever (transitionend never fires) — freeze-and-restart via advance() recovers both that transient stall and the permanent isEnd deadlock.
function startStallWatchdog(
  swiper: Swiper,
  speed: number,
  isPausedByUs: () => boolean,
  reverse: boolean
): () => void {
  let lastObservedTranslateX: number | null = null;
  let lastProgressAt = Date.now();

  const intervalId = setInterval(() => {
    if (swiper.destroyed || isPausedByUs()) {
      return;
    }
    const controllable = swiper as unknown as SwiperWithTranslateControl;
    if (!controllable.wrapperEl) {
      return;
    }
    const currentTranslateX = getCurrentTranslateX(controllable.wrapperEl);
    const now = Date.now();
    if (
      lastObservedTranslateX === null ||
      Math.abs(currentTranslateX - lastObservedTranslateX) > 0.5
    ) {
      lastObservedTranslateX = currentTranslateX;
      lastProgressAt = now;
      return;
    }
    if (now - lastProgressAt > STALL_GRACE_MS) {
      freezeAtCurrentPosition(swiper);
      advance(swiper, speed, reverse);
      lastObservedTranslateX = null;
      lastProgressAt = now;
    }
  }, STALL_CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
}

function wireContinuousAutoplay(
  container: HTMLElement,
  swiper: Swiper,
  speed: number,
  reverse: boolean
): void {
  resyncActiveIndexOnAutoplayResume(swiper);

  let hovered = false;
  let focused = false;
  let pressed = false;
  let modalOpen = false;
  let isPaused = false;
  let resumeMidTransition = false;
  let resumeTargetIndex = -1;
  let resumeFrozenTranslateX = 0;
  let dragEndedTranslateX: number | null = null;

  const evaluate = () => {
    const shouldPause = hovered || focused || pressed || modalOpen;
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
    } else if (dragEndedTranslateX !== null) {
      const target = computeCatchUpToNextBoundary(swiper, dragEndedTranslateX, speed, reverse);
      dragEndedTranslateX = null;
      if (target) {
        resumeWithCatchUp(swiper, target, speed, reverse);
      } else {
        advance(swiper, speed, reverse);
      }
    } else if (resumeMidTransition) {
      const target = computeCatchUpToIndex(
        swiper,
        resumeTargetIndex,
        resumeFrozenTranslateX,
        speed
      );
      if (target) {
        resumeWithCatchUp(swiper, target, speed, reverse);
      } else {
        advance(swiper, speed, reverse);
      }
    } else {
      advance(swiper, speed, reverse);
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

  document.addEventListener("kt-modal:open", (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    if (!trigger || !container.contains(trigger)) {
      return;
    }
    modalOpen = true;
    evaluate();
  });

  document.addEventListener("kt-modal:close", (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    if (!trigger || !container.contains(trigger)) {
      return;
    }
    modalOpen = false;
    // modal-manager.ts refocuses the trigger before dispatching this event, which would otherwise leave `focused` stuck true forever (no focusout ever comes) and permanently block the resume below.
    focused = false;
    evaluate();
  });

  // Defense-in-depth: resume on scroll if paused with no genuine reason left — doesn't override a real ongoing hover or press.
  window.addEventListener(
    "scroll",
    () => {
      if (isPaused && !hovered && !pressed && !modalOpen) {
        focused = false;
        evaluate();
      }
    },
    { passive: true }
  );

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
    } else {
      // Chrome's touch-from-mouse emulation fires a genuine mouseenter with no matching mouseleave — real touch has no hover concept, so clear it here instead of leaving it stuck true.
      hovered = false;
    }
    // A drag past Swiper's own 200ms sliderFirstMove threshold force-resumes autoplay via FreeMode's _freeModeStaticRelease regardless of pointer type — reassert our own pause to override it.
    swiper.autoplay.pause();
    // Swiper's own "touchEnd" doesn't reliably fire before this pointerup listener under real/emulated touch, so the drag-end position is captured here directly instead of in a separate touchEnd handler.
    if (isPaused) {
      resumeMidTransition = false;
      dragEndedTranslateX = freezeAtCurrentPosition(swiper);
    }
    evaluate();
  };
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);

  if (typeof IntersectionObserver === "undefined") {
    swiper.autoplay.start();
    swiper.on(
      "destroy",
      startStallWatchdog(swiper, speed, () => isPaused, reverse)
    );
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      swiper.autoplay.start();
      swiper.on(
        "destroy",
        startStallWatchdog(swiper, speed, () => isPaused, reverse)
      );
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
