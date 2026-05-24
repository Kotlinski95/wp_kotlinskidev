import "swiper/swiper-bundle.css";
import { initSwiper } from "@utils/carousel/initSwiper";
import type { CarouselSettings } from "@utils/carousel/types";

const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};

const initHeroCarousel = (el: HTMLElement): void => {
  el.style.visibility = "hidden";
  initSwiper(el, parseSettings(el));
  el.style.visibility = "visible";
};

const init = (): void => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        initHeroCarousel(entry.target as HTMLElement);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "200px 0px" }
  );

  document
    .querySelectorAll<HTMLElement>(".hero-carousel__swiper[data-carousel-settings]")
    .forEach((el) => observer.observe(el));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
