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
  // Swiper always sets its wrapper transform via translate3d() — most
  // browsers report that back from getComputedStyle() as a 2D matrix() when
  // the z component is 0, but WebKit (Safari/iOS) preserves it as a 16-value
  // matrix3d(), where the x-translation lives at index 12, not 4. Missing
  // this made every mobile Safari freeze read translateX as 0 regardless of
  // the real position, snapping the carousel back to its start on release.
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
  fullSpeed: number
): CatchUpTarget | null {
  const grid = (swiper as unknown as SwiperWithTranslateControl).snapGrid;
  const stepDistance = Math.abs((grid?.[1] ?? 0) - (grid?.[0] ?? 0));
  if (!grid?.length || !stepDistance) {
    return null;
  }
  const traveled = Math.abs(frozenTranslateX);
  const nextBoundary = grid.find((position) => position > traveled) ?? traveled + stepDistance;
  const remainingDistance = nextBoundary - traveled;
  const ratio = Math.min(Math.max(remainingDistance / stepDistance, 0), 1);
  return { translateX: -nextBoundary, duration: Math.max(fullSpeed * ratio, 50) };
}

// Finishing an interrupted leg by re-navigating via slideTo()/slideNext()
// with an artificially short duration can trip Swiper's own loop-boundary
// reindexing into a visible one-frame translate jump when the target is
// close to (or exactly at) a grid line — confirmed via live-site velocity
// sampling. Animating the raw translate directly sidesteps Swiper's index
// bookkeeping for the catch-up entirely; a plain, full-speed slideNext()
// only fires once that's genuinely finished, which loop mode already
// handles cleanly since it's a real index change, not a re-navigation to
// wherever we already are.
function resumeWithCatchUp(swiper: Swiper, target: CatchUpTarget, fullSpeed: number): void {
  const controllable = swiper as unknown as SwiperWithTranslateControl;
  const wrapperEl = controllable.wrapperEl;
  if (!wrapperEl) {
    swiper.slideNext(fullSpeed, true, true);
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
    swiper.slideNext(fullSpeed, true, true);
  };
  wrapperEl.addEventListener("transitionend", onCatchUpEnd);
}

function wireContinuousAutoplay(container: HTMLElement, swiper: Swiper, speed: number): void {
  resyncActiveIndexOnAutoplayResume(swiper);

  let hovered = false;
  let focused = false;
  let pressed = false;
  let isPaused = false;
  let resumeMidTransition = false;
  let resumeTargetIndex = -1;
  let resumeFrozenTranslateX = 0;
  let dragEndedTranslateX: number | null = null;

  const evaluate = () => {
    const shouldPause = hovered || focused || pressed;
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
      const target = computeCatchUpToNextBoundary(swiper, dragEndedTranslateX, speed);
      dragEndedTranslateX = null;
      if (target) {
        resumeWithCatchUp(swiper, target, speed);
      } else {
        swiper.slideNext(speed, true, true);
      }
    } else if (resumeMidTransition) {
      const target = computeCatchUpToIndex(
        swiper,
        resumeTargetIndex,
        resumeFrozenTranslateX,
        speed
      );
      if (target) {
        resumeWithCatchUp(swiper, target, speed);
      } else {
        swiper.slideNext(speed, true, true);
      }
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
      // Real touch has no hover concept — but Chrome's own touch-from-mouse
      // emulation (what DevTools' device toolbar uses when you drag with an
      // actual mouse over a touch-emulated viewport) fires a genuine
      // mouseenter on the container alongside the synthetic touch events,
      // with no matching mouseleave to ever clear it. Left uncleared,
      // `hovered` stays stuck true forever, permanently blocking evaluate()
      // from ever resuming — confirmed via Input.emulateTouchFromMouseEvent,
      // the exact CDP mechanism DevTools itself uses for this.
      hovered = false;
    }
    // A drag held past Swiper's own internal 200ms "sliderFirstMove"
    // threshold flips its FreeMode module into force-resuming autoplay
    // on release (via _freeModeStaticRelease), for any pointer type —
    // touch drags trip this exactly like mouse drags do, and touch never
    // sets `hovered`, so gating this on hover/focus left touch unguarded.
    // Reassert our own pause unconditionally to override it; evaluate()
    // right after still decides the real resume/catch-up from our own
    // hover/focus/press state.
    swiper.autoplay.pause();
    // Re-freeze at the position the drag actually ended at, right here —
    // not in a separate swiper.on("touchEnd", ...) handler. Swiper's own
    // semantic "touchEnd" event does not reliably fire before this pointerup
    // listener under real/emulated touch (confirmed via Chrome's own
    // Input.emulateTouchFromMouseEvent, the exact mechanism DevTools' device
    // toolbar uses to turn a mouse drag into touch input): it can fire
    // *after*, by which point isPaused had already flipped to false below,
    // so the old touchEnd handler's own `if (!isPaused) return;` guard
    // silently skipped recording the drag-end position entirely — evaluate()
    // then resumed from the stale pre-drag freeze point instead, visibly
    // snapping backward before the next natural cycle corrected it forward.
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
