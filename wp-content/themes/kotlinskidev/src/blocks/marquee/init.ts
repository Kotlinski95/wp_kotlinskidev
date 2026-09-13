import "swiper/swiper.css";
import { SwiperInit } from "../slider/swiper-init";

const markDuplicateHalfNonTabbable = (el: HTMLElement): void => {
  const items = Array.from(el.querySelectorAll<HTMLElement>(".kt-marquee__item"));
  const half = Math.floor(items.length / 2);
  items.slice(half).forEach((item) => {
    item.setAttribute("aria-hidden", "true");
    item.setAttribute("tabindex", "-1");
  });
};

const initMarqueeSwiper = (el: HTMLElement): void => {
  const uniqueItemCount = el.querySelectorAll(".kt-marquee__item").length / 2;
  markDuplicateHalfNonTabbable(el);
  const speedSeconds = parseInt(el.dataset.marqueeSpeed ?? "30", 10);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplayTime = Math.max(0.2, speedSeconds / (uniqueItemCount || 10));

  SwiperInit(el, {
    slidesPerView: "auto",
    slidesPerMobile: "auto",
    slidesPerTablet: "auto",
    slidesPerDesktop: "auto",
    spaceBetween: 40,
    loop: true,
    draggable: false,
    autoplay: !reducedMotion,
    continuousAutoplay: !reducedMotion,
    autoplayTime,
  });

  el.style.visibility = "visible";
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>(".kt-marquee.swiper").forEach(initMarqueeSwiper);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
