import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const init = (): void => {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (!pageWrapper) return;

  const tracks = gsap.utils.toArray<HTMLElement>(".scroll-section__track");

  tracks.forEach((track) => {
    const items = track.querySelectorAll<HTMLElement>(".scroll-section__item");
    const lastItem = items[items.length - 1];
    if (!lastItem) return;

    const distance = () => {
      const lastItemBounds = lastItem.getBoundingClientRect();
      const trackBounds = track.getBoundingClientRect();

      return Math.max(0, lastItemBounds.right - trackBounds.right);
    };

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top center",
        pinnedContainer: pageWrapper,
        end: () => "+=" + distance(),
        pin: pageWrapper,
        scrub: true,
        invalidateOnRefresh: true,
        markers: true,
      },
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
