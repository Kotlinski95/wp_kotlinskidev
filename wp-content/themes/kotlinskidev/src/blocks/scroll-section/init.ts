import "@utils/webpack-public-path";
import { APP_SHELL_MEDIA_QUERY, getScrollContainer } from "../../scripts/utils";

type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

const buildTriggers = (gsap: GsapModule["gsap"], scroller: HTMLElement | null): void => {
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
        ...(scroller ? { scroller, pinType: "fixed" as const } : {}),
      },
    });
  });
};

const init = async (): Promise<void> => {
  if (!document.querySelector(".scroll-section__track")) {
    return;
  }

  const [{ gsap }, { ScrollTrigger }]: [GsapModule, ScrollTriggerModule] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mediaContext = gsap.matchMedia();
  mediaContext.add(
    { shell: APP_SHELL_MEDIA_QUERY, document: `not ${APP_SHELL_MEDIA_QUERY}` },
    (context) => {
      const conditions = context.conditions as { shell: boolean };
      buildTriggers(gsap, conditions.shell ? getScrollContainer() : null);
    }
  );
  window.addEventListener("kt:scroll-container-change", () => ScrollTrigger.refresh());
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void init());
} else {
  void init();
}
