import { gsap } from "gsap";

const PARALLAX_INTENSITY_DEFAULT = 15;
const PARALLAX_INTENSITY_MIN = 0;
const PARALLAX_INTENSITY_MAX = 30;

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function readParallaxIntensity(cover: HTMLElement): number {
  const raw = Number(cover.dataset.parallaxIntensity);
  if (Number.isNaN(raw)) {
    return PARALLAX_INTENSITY_DEFAULT;
  }
  return Math.min(PARALLAX_INTENSITY_MAX, Math.max(PARALLAX_INTENSITY_MIN, raw));
}

function initGsapParallaxFallback(): void {
  if (!document.querySelector(".scroll-section")) {
    return;
  }

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(hover: none)").matches
  ) {
    return;
  }

  const covers = gsap.utils.toArray<HTMLElement>(".wp-block-cover.enable-parallax");

  covers.forEach((cover) => {
    const image = cover.querySelector<HTMLElement>(".wp-block-cover__image-background");
    if (!image) {
      return;
    }

    // Deliberately not GSAP ScrollTrigger's own trigger/start/end: those cache the cover's
    // pixel position in document coordinates at the last refresh() call, which goes stale on a
    // page with other scroll-section pins above it — each pin/unpin cycle reflows document height
    // (pinSpacing:false, no static spacer) after the cache was last computed, permanently
    // desyncing this trigger's window from the cover's real viewport position. Recomputing via
    // getBoundingClientRect() on every update is immune to that by construction, since it never
    // trusts a cached position — same technique gsap-sticky.ts already uses for the identical
    // class of problem (see its own resync loop).
    const intensity = readParallaxIntensity(cover);

    const update = (): void => {
      const rect = cover.getBoundingClientRect();
      const totalTravel = window.innerHeight + rect.height;
      const progress = clampProgress((window.innerHeight - rect.top) / totalTravel);
      const yPercent = -intensity + progress * (intensity * 2);
      gsap.set(image, { yPercent });
    };

    // Both a ticker (rAF) and a scroll listener, not either alone: the ticker alone stalls
    // whenever rAF is throttled (e.g. tab loses focus mid-scroll, some automation/testing
    // contexts), and a scroll listener alone misses the initial rest-state position and any
    // layout-driven movement between scroll events (e.g. an accordion above the cover opening).
    gsap.ticker.add(update);
    window.addEventListener("scroll", update, { passive: true });
    update();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGsapParallaxFallback);
} else {
  initGsapParallaxFallback();
}
