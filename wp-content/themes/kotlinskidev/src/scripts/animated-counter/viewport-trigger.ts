import { onScroll } from "../utils";
import { animateCounter, showFinalValue } from "./counter-animation";
import { getCachedReducedMotionPreference, readReducedMotionPreference } from "./reduced-motion";

const PENDING_COUNTER_SELECTOR = ".animated-counter:not([data-counter-animated])";
const ANIMATED_ATTRIBUTE = "data-counter-animated";
const VISIBILITY_THRESHOLD = 0.1;
const OBSERVER_ROOT_MARGIN = "0px 0px -20px 0px";
const FALLBACK_BOTTOM_OFFSET_PX = 50;

const startCounterWhenIdle = (element: HTMLElement): void => {
  if (getCachedReducedMotionPreference()) {
    showFinalValue(element);
  } else if ("requestIdleCallback" in window) {
    requestIdleCallback(() => animateCounter(element));
  } else {
    animateCounter(element);
  }
};

const observeCounters = (counterElements: NodeListOf<HTMLElement>): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          if (!element.hasAttribute(ANIMATED_ATTRIBUTE)) {
            startCounterWhenIdle(element);
          }

          observer.unobserve(element);
        }
      });
    },
    {
      threshold: VISIBILITY_THRESHOLD,
      rootMargin: OBSERVER_ROOT_MARGIN,
    }
  );

  counterElements.forEach((element) => {
    observer.observe(element);
  });
};

const pollCounterVisibility = (counterElements: NodeListOf<HTMLElement>): void => {
  const checkVisibility = (): void => {
    const windowHeight = window.innerHeight;

    counterElements.forEach((element) => {
      if (element.hasAttribute(ANIMATED_ATTRIBUTE)) {
        return;
      }

      const rect = element.getBoundingClientRect();

      if (rect.top < windowHeight - FALLBACK_BOTTOM_OFFSET_PX && rect.bottom > 0) {
        if (readReducedMotionPreference()) {
          showFinalValue(element);
        } else {
          animateCounter(element);
        }
      }
    });
  };

  checkVisibility();
  onScroll(checkVisibility);
  (window as Window).addEventListener("resize", checkVisibility, {
    passive: true,
  });
};

export const initCounterAnimations = (): void => {
  const counterElements = document.querySelectorAll<HTMLElement>(PENDING_COUNTER_SELECTOR);

  if (counterElements.length === 0) {
    return;
  }

  if ("IntersectionObserver" in window) {
    observeCounters(counterElements);
  } else {
    pollCounterVisibility(counterElements);
  }
};
