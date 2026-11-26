import {
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
  A11y,
  Mousewheel,
  Parallax,
  Scrollbar,
  Zoom,
  FreeMode,
} from "swiper/modules";
import type { SliderOptions } from "./slider-options";

const DEFAULT_SPACE_BETWEEN_PX = 16;
const MOBILE_BREAKPOINT_PX = 640;
const TABLET_BREAKPOINT_PX = 768;
const DESKTOP_BREAKPOINT_PX = 1024;
const ZOOM_MAX_RATIO = 5;
const RESISTANCE_RATIO = 0.85;
const LAZY_PRELOAD_AMOUNT = 3;
const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_CONTINUOUS_SECONDS_PER_PASS = 20;
const SMOOTH_TRANSITION_SPEED_MS = 800;
const DEFAULT_TRANSITION_SPEED_MS = 300;
const TOUCH_ANGLE_DEGREES = 45;

interface SpaceBetweenByViewport {
  mobile: number;
  tablet: number;
  desktop: number;
  hasResponsiveValues: boolean;
}

export type SwiperParameters = Record<string, unknown>;

const listSwiperModules = () => [
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
  A11y,
  Mousewheel,
  Parallax,
  Scrollbar,
  Zoom,
  FreeMode,
];

const isNumber = (value: unknown): value is number => typeof value === "number";

function resolveSpaceBetween(options: SliderOptions): SpaceBetweenByViewport {
  const desktop = isNumber(options.spaceBetween) ? options.spaceBetween : DEFAULT_SPACE_BETWEEN_PX;
  return {
    mobile: isNumber(options.spaceBetweenMobile) ? options.spaceBetweenMobile : desktop,
    tablet: isNumber(options.spaceBetweenTablet) ? options.spaceBetweenTablet : desktop,
    desktop,
    hasResponsiveValues:
      isNumber(options.spaceBetweenMobile) || isNumber(options.spaceBetweenTablet),
  };
}

function canLoopSlides(options: SliderOptions, slideCount: number): boolean {
  if (options.centerSlides ?? false) {
    return slideCount > 2;
  }
  const slidesPerView = options.slidesPerView || 1;
  const loopThreshold = isNumber(slidesPerView) ? slidesPerView : 1;
  return slideCount > loopThreshold * 2;
}

function buildBreakpoints(options: SliderOptions, spaceBetween: SpaceBetweenByViewport) {
  const spacingFor = (value: number) => spaceBetween.hasResponsiveValues && { spaceBetween: value };
  return {
    [MOBILE_BREAKPOINT_PX]: {
      slidesPerView: options.slidesPerMobile || 1,
      ...spacingFor(spaceBetween.mobile),
    },
    [TABLET_BREAKPOINT_PX]: {
      slidesPerView: options.slidesPerTablet || 1,
      ...spacingFor(spaceBetween.tablet),
    },
    [DESKTOP_BREAKPOINT_PX]: {
      slidesPerView: options.slidesPerDesktop || 1,
      ...spacingFor(spaceBetween.desktop),
    },
  };
}

export function computeSpeed(options: SliderOptions, continuousAutoplay: boolean): number {
  if (continuousAutoplay) {
    return (options.autoplayTime || DEFAULT_CONTINUOUS_SECONDS_PER_PASS) * MILLISECONDS_PER_SECOND;
  }
  return options.smoothTransition ? SMOOTH_TRANSITION_SPEED_MS : DEFAULT_TRANSITION_SPEED_MS;
}

function buildAutoplayParams(
  options: SliderOptions,
  continuousAutoplay: boolean
): SwiperParameters | boolean {
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
      delay: (options.autoplayTime || 1) * MILLISECONDS_PER_SECOND,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    };
  }

  return options.autoplay ?? true;
}

function buildSmoothTouchParameters(options: SliderOptions, continuousAutoplay: boolean) {
  const draggable = options.draggable ?? true;
  if (!options.smoothTransition || continuousAutoplay || !draggable) {
    return {};
  }
  return {
    cssMode: false,
    touchRatio: 1,
    touchAngle: TOUCH_ANGLE_DEGREES,
    simulateTouch: true,
    followFinger: true,
    shortSwipes: true,
    longSwipes: true,
  };
}

export function buildSwiperParameters(
  options: SliderOptions,
  slideCount: number
): SwiperParameters {
  const centerSlides = options.centerSlides ?? false;
  const continuousAutoplay = Boolean(options.continuousAutoplay);
  const draggable = options.draggable ?? true;
  const spaceBetween = resolveSpaceBetween(options);

  return {
    centeredSlides: centerSlides,
    createElements: true,
    grabCursor: draggable && (options.grabCursor ?? true),
    initialSlide: 0,
    modules: listSwiperModules(),
    navigation: options.navigation ?? false,
    simulateTouch: draggable && (options.simulateTouch ?? true),
    loop: (options.loop ?? true) && canLoopSlides(options, slideCount),
    autoplay: buildAutoplayParams(options, continuousAutoplay),
    slidesPerView: centerSlides ? "auto" : options.slidesPerView || 1,
    spaceBetween: spaceBetween.mobile,
    breakpoints: centerSlides ? undefined : buildBreakpoints(options, spaceBetween),
    zoom: { maxRatio: ZOOM_MAX_RATIO },
    parallax: true,
    mousewheel: options.mousewheel ?? false,
    keyboard: options.keyboard ?? { enabled: true, onlyInViewport: true },
    lazy: {
      loadPrevNext: true,
      loadPrevNextAmount: LAZY_PRELOAD_AMOUNT,
      loadOnTransitionStart: true,
    },
    speed: computeSpeed(options, continuousAutoplay),
    allowTouchMove: draggable,
    resistanceRatio: RESISTANCE_RATIO,
    ...(continuousAutoplay && {
      freeMode: { enabled: true, momentum: false, sticky: false },
    }),
    ...buildSmoothTouchParameters(options, continuousAutoplay),
  };
}
