import { DEFAULT_EASING, resolveEasing } from "./easing";
import { buildCounterText, extractNumberInfo } from "./number-format";

const DEFAULT_TEXT = "100";
const DEFAULT_DURATION_MS = "2000";
const ANIMATED_ATTRIBUTE = "data-counter-animated";

const activeAnimations = new Map<HTMLElement, number>();

export const cancelActiveAnimations = (): void => {
  activeAnimations.forEach((animationId) => {
    cancelAnimationFrame(animationId);
  });
  activeAnimations.clear();
};

export const showFinalValue = (element: HTMLElement): void => {
  const numberInfo = extractNumberInfo(element.textContent || DEFAULT_TEXT);

  element.textContent = buildCounterText(numberInfo, numberInfo.number);
  element.setAttribute(ANIMATED_ATTRIBUTE, "true");
};

export const animateCounter = (element: HTMLElement): void => {
  const numberInfo = extractNumberInfo(element.textContent || DEFAULT_TEXT);

  const startValue = 0;
  const endValue = numberInfo.number;
  const duration = Number.parseInt(
    element.getAttribute("data-counter-duration") || DEFAULT_DURATION_MS
  );
  const easingFunction = resolveEasing(
    element.getAttribute("data-counter-easing") || DEFAULT_EASING
  );

  let startTime: number | null = null;
  const range = endValue - startValue;
  let lastDisplayValue = -1;
  let animationId: number;

  const animate = (currentTime: number): void => {
    if (startTime === null) {
      startTime = currentTime;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunction(progress);
    const currentValue = startValue + range * easedProgress;
    const displayValue = Math.max(0, Math.floor(currentValue));

    if (displayValue !== lastDisplayValue || progress === 1) {
      lastDisplayValue = displayValue;
      element.textContent = buildCounterText(numberInfo, progress === 1 ? endValue : displayValue);
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
      activeAnimations.set(element, animationId);
    } else {
      activeAnimations.delete(element);
      element.setAttribute(ANIMATED_ATTRIBUTE, "true");
    }
  };

  animationId = requestAnimationFrame(animate);
  activeAnimations.set(element, animationId);
};
