import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../scripts/scroll-trigger-refresh";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const init = (): void => {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (!pageWrapper) {
    return;
  }

  const tracks = gsap.utils.toArray<HTMLElement>(".scroll-section__track");

  tracks.forEach((track) => {
    const items = track.querySelectorAll<HTMLElement>(".scroll-section__item");
    const lastItem = items[items.length - 1];
    if (!lastItem) {
      return;
    }

    const section = track.closest<HTMLElement>("[data-scroll-section]");
    const markers = section?.dataset.markers === "true";
    const triggerPoint = section?.dataset.trigger ?? "center";
    const start = `top ${triggerPoint}`;
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start,
        pinnedContainer: pageWrapper,
        end: () => "+=" + distance(),
        pin: pageWrapper,
        pinSpacing: false,
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
