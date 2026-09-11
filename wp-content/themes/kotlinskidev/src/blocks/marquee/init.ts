import "swiper/swiper.css";
import { SwiperInit } from "../slider/swiper-init";

const MODAL_ID = "kt-modal-marquee";

const populateModal = (trigger: HTMLElement): void => {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    return;
  }

  const icon = modal.querySelector<HTMLImageElement>("#kt-modal-marquee-icon");
  const title = modal.querySelector<HTMLElement>("#kt-modal-marquee-title");
  const body = modal.querySelector<HTMLElement>("#kt-modal-marquee-body");
  const link = modal.querySelector<HTMLAnchorElement>("#kt-modal-marquee-link");

  const iconSrc = trigger.querySelector("img")?.getAttribute("src") ?? "";
  if (icon) {
    icon.src = iconSrc;
    icon.hidden = iconSrc === "";
  }
  if (title) {
    title.textContent = trigger.dataset.marqueeLabel ?? "";
  }
  if (body) {
    body.textContent = trigger.dataset.marqueeDescription ?? "";
  }
  if (link) {
    const docUrl = trigger.dataset.marqueeDocUrl ?? "";
    link.href = docUrl;
    link.hidden = docUrl === "";
  }
};

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

  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>(
      `[data-kt-modal-target="${MODAL_ID}"]`
    );
    if (trigger) {
      populateModal(trigger);
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
