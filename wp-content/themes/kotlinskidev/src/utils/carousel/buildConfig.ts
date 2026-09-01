import type { CarouselSettings } from "./types";

const EFFECT_OPTIONS: Record<Exclude<CarouselSettings["transitionEffect"], "slide">, object> = {
  fade: { fadeEffect: { crossFade: true } },
  cube: { cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 } },
  coverflow: {
    coverflowEffect: { rotate: 30, stretch: 0, depth: 100, modifier: 1, slideShadows: true },
  },
  flip: { flipEffect: { slideShadows: true, limitRotation: true } },
  cards: { cardsEffect: { slideShadows: true, perSlideOffset: 8, perSlideRotate: 2 } },
};

export const buildSwiperConfig = (settings: Partial<CarouselSettings>) => {
  const {
    showArrows = true,
    showPagination = true,
    showScrollbar = false,
    loop = true,
    draggable = true,
    autoplay = false,
    autoplayDelay = 3000,
    slidesPerView = 1,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
    transitionEffect = "slide",
  } = settings;

  return {
    loop,
    speed: 300,
    grabCursor: draggable,
    simulateTouch: draggable,
    allowTouchMove: draggable,
    keyboard: { enabled: true, onlyInViewport: false },
    slidesPerView,
    breakpoints: {
      640: { slidesPerView: slidesPerMobile },
      768: { slidesPerView: slidesPerTablet },
      1024: { slidesPerView: slidesPerDesktop },
    },
    navigation: showArrows
      ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
      : false,
    pagination:
      showPagination && !showScrollbar ? { el: ".swiper-pagination", clickable: true } : false,
    scrollbar:
      showScrollbar && !showPagination ? { el: ".swiper-scrollbar", draggable: true } : false,
    autoplay: autoplay
      ? { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true }
      : false,
    ...(transitionEffect !== "slide"
      ? { effect: transitionEffect, ...EFFECT_OPTIONS[transitionEffect] }
      : {}),
  };
};
