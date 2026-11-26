import { trackEvent } from "../track-event";

const ANIMATION_DURATION = 350;
const ANIMATION_EASING = "ease-in-out";
const ANIMATING_CLASS = "kt-details-animating";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface TransitionMeasurement {
  startHeight: number;
  endHeight: number;
  startMargin: string;
  endMargin: string;
}

const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const measureTransition = (
  details: HTMLDetailsElement,
  summary: HTMLElement,
  targetOpen: boolean
): TransitionMeasurement => {
  const startHeight = details.getBoundingClientRect().height;
  const startMargin = getComputedStyle(summary).marginBottom;
  details.open = targetOpen;
  const endHeight = details.getBoundingClientRect().height;
  const endMargin = getComputedStyle(summary).marginBottom;
  return { startHeight, endHeight, startMargin, endMargin };
};

const finishAnimation = (details: HTMLDetailsElement, setOpen: boolean): void => {
  details.open = setOpen;
  details.classList.remove(ANIMATING_CLASS);
  details.style.height = "";
};

const playTransition = (
  details: HTMLDetailsElement,
  summary: HTMLElement,
  measurement: TransitionMeasurement
): Animation => {
  const { startHeight, endHeight, startMargin, endMargin } = measurement;
  const animation = details.animate(
    [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
    { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }
  );
  summary.animate([{ marginBottom: startMargin }, { marginBottom: endMargin }], {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING,
  });
  return animation;
};

export const animateDetails = (details: HTMLDetailsElement, summary: HTMLElement): void => {
  if (details.classList.contains(ANIMATING_CLASS)) {
    return;
  }

  const isOpen = details.hasAttribute("open");

  if (!isOpen) {
    trackEvent("faq_expand", { question: summary.textContent?.trim() ?? "" });
  }

  if (prefersReducedMotion()) {
    details.open = !isOpen;
    return;
  }

  details.classList.add(ANIMATING_CLASS);

  const measurement = measureTransition(details, summary, !isOpen);

  if (isOpen) {
    details.open = true;
  }

  const animation = playTransition(details, summary, measurement);
  animation.onfinish = () => finishAnimation(details, !isOpen);
};
