import { beginProgrammaticScroll, endProgrammaticScroll, getScrollTop, scrollTo } from "../utils";
import { trackEvent } from "../track-event";

const BAR_TRIGGER_CLASS = "kt-scroll-to-top__trigger";

const waitForScrollToReachTop = (mainElement: HTMLElement): void => {
  let lastScrollTop = -1;
  const onFrame = (): void => {
    const currentScrollTop = getScrollTop();
    if (currentScrollTop === 0 && lastScrollTop === 0) {
      endProgrammaticScroll();
      mainElement.focus();
      return;
    }
    lastScrollTop = currentScrollTop;
    requestAnimationFrame(onFrame);
  };
  requestAnimationFrame(onFrame);
};

export const onActivateScrollToTop = (event: Event): void => {
  event.preventDefault();
  const mainElement = document.querySelector("main");
  if (!mainElement) {
    return;
  }
  const trigger = event.currentTarget as HTMLElement | null;
  trackEvent("scroll_to_top_click", {
    variant: trigger?.classList.contains(BAR_TRIGGER_CLASS) ? "bar" : "fixed",
  });
  mainElement.setAttribute("tabindex", "-1");
  beginProgrammaticScroll();
  scrollTo(0, "smooth");
  waitForScrollToReachTop(mainElement);
};
