import { getMaxScrollTop, getScrollTop, onScroll, rafThrottle } from "../utils";
import { onActivateScrollToTop } from "./activate-scroll-to-top";

const SHOW_AFTER_SCROLL_PX = 100;

interface FloatingButtonParts {
  button: HTMLElement;
  wrapper: HTMLElement;
  progressRing: SVGCircleElement;
}

const findFloatingButtonParts = (): FloatingButtonParts | null => {
  const button = document.getElementById("scroll-to-top");
  const wrapper = document.querySelector(".scroll-to-top-wrapper") as HTMLElement;
  const progressRing = document.querySelector(".progress-ring__progress") as SVGCircleElement;
  if (!button || !wrapper || !progressRing) {
    return null;
  }
  return { button, wrapper, progressRing };
};

const updateProgressRing = (progressRing: SVGCircleElement, scrollTop: number): void => {
  const maxScrollTop = getMaxScrollTop();
  const scrollProgress = maxScrollTop > 0 ? Math.min(scrollTop / maxScrollTop, 1) : 1;
  const circumference = Number.parseFloat(progressRing.dataset.circumference || "0");
  const offset = circumference - scrollProgress * circumference;
  progressRing.style.strokeDashoffset = `${offset}`;
};

const syncVisibility = ({ button, wrapper, progressRing }: FloatingButtonParts): void => {
  const scrollTop = getScrollTop();
  if (scrollTop > SHOW_AFTER_SCROLL_PX) {
    button.style.display = "block";
    wrapper.classList.add("show");
    updateProgressRing(progressRing, scrollTop);
  } else {
    button.style.display = "none";
    wrapper.classList.remove("show");
  }
};

const bindActivation = (button: HTMLElement): void => {
  button.addEventListener("click", onActivateScrollToTop);
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      onActivateScrollToTop(event);
    }
  });
};

export const initFloatingScrollToTopButton = (): void => {
  const parts = findFloatingButtonParts();
  if (!parts) {
    return;
  }
  const onScrollSync = (): void => syncVisibility(parts);
  onScrollSync();
  onScroll(rafThrottle(onScrollSync));
  bindActivation(parts.button);
};
