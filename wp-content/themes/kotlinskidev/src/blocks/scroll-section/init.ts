import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const init = (): void => {
  const tracks = gsap.utils.toArray<HTMLElement>(".scroll-section__track");

  tracks.forEach((track) => {
    const items = track.querySelectorAll<HTMLElement>(".scroll-section__item");
    const lastItem = items[items.length - 1];
    if (!lastItem) {
      return;
    }

    const section = track.closest<HTMLElement>("[data-scroll-section]");
    if (!section) {
      return;
    }

    const markers = section.dataset.markers === "true";
    const triggerPoint = section.dataset.trigger ?? "center";
    const start = `${triggerPoint} ${triggerPoint}`;
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

    const pinTarget = section.closest<HTMLElement>(".scroll-section-pin-boundary") ?? section;

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start,
        end: () => "+=" + distance(),
        pin: pinTarget,
        scrub: true,
        invalidateOnRefresh: true,
        markers,
      },
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
