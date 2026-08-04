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
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
  slidesPerMobile?: number;
  slidesPerTablet?: number;
  slidesPerDesktop?: number;
  scrollbar?: boolean;
  loop?: boolean;
  mousewheel?: boolean;
  keyboard?: boolean;
  spaceBetween?: number;
  grabCursor?: boolean;
  simulateTouch?: boolean;
  centerSlides?: boolean;
}

export function SwiperInit(container: HTMLElement, options: SliderOptions = {}): Swiper {
  const slideCount = container.querySelectorAll(":scope > .swiper-wrapper > .swiper-slide").length;
  const slidesPerView = options.slidesPerView || 1;
  const canLoop = slideCount > slidesPerView * 2;

  const parameters: Record<string, unknown> = {
    centeredSlides: options.centerSlides ?? false,
    createElements: true,
    grabCursor: options.grabCursor ?? true,
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
    simulateTouch: options.simulateTouch ?? true,
    loop: (options.loop ?? true) && canLoop,
    autoplay:
      options.autoplay && options.autoplayTime
        ? {
            delay: options.smoothTransition ? 1 : (options.autoplayTime || 1) * 1000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        : (options.autoplay ?? true),
    slidesPerView: options.slidesPerView || 1,
    spaceBetween: typeof options.spaceBetween === "number" ? options.spaceBetween : 16,
    breakpoints: {
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
    speed: options.smoothTransition ? (options.autoplayTime || 5) * 1000 : 300,
    allowTouchMove: true,
    resistanceRatio: 0.85,
    ...(options.smoothTransition && {
      cssMode: false,
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      followFinger: true,
      shortSwipes: true,
      longSwipes: true,
      freeMode: {
        enabled: true,
        momentum: false,
        sticky: false,
      },
    }),
  };

  if (!options.scrollbar && options.pagination) {
    parameters.pagination = true;
  }

  if (options.scrollbar && !options.pagination) {
    parameters.scrollbar = true;
  }

  const swiper = new Swiper(container, parameters);

  if (options.smoothTransition) {
    const swiperWrapper = container.querySelector<HTMLElement>(".swiper-wrapper");
    if (swiperWrapper) {
      swiperWrapper.style.transitionTimingFunction = "linear";
    }
  }

  if (options.autoplay) {
    resyncActiveIndexOnAutoplayResume(swiper);

    let userInteracted = false;

    container.addEventListener("click", () => {
      userInteracted = true;
      swiper.autoplay.stop();
    });

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target as Node) && userInteracted) {
        userInteracted = false;
        swiper.autoplay.start();
      }
    });
  }

  return swiper;
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
