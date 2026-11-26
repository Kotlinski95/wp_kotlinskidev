import { BAND_THRESHOLDS, bandRootMargin, readInViewBandConfig } from "@utils/in-view-band";
import { applyTarget } from "./animation-loop";
import type { CanvasInstance } from "./canvas-instance";
import type { FeatureCanvasTrigger } from "./types";

const IN_VIEW_THRESHOLD = 0.4;
const HOVER_NONE_QUERY = "(hover: none)";

export interface InputBindingOptions {
  host: HTMLElement;
  trigger: FeatureCanvasTrigger;
  touchAutoplay: boolean;
}

type Cleanup = () => void;

const HOVER_FOCUS_EVENT_TARGETS: ReadonlyArray<readonly [string, number]> = [
  ["mouseenter", 1],
  ["mouseleave", 0],
  ["focusin", 1],
  ["focusout", 0],
];

const bindHoverAndFocus = (instance: CanvasInstance, hoverTarget: Element): Cleanup[] =>
  HOVER_FOCUS_EVENT_TARGETS.map(([type, target]) => {
    const handler = (): void => applyTarget(instance, target);
    hoverTarget.addEventListener(type, handler);
    return () => hoverTarget.removeEventListener(type, handler);
  });

const bindInViewTrigger = (
  instance: CanvasInstance,
  options: InputBindingOptions,
  touchOnly: boolean
): Cleanup[] => {
  if (typeof IntersectionObserver === "undefined") {
    applyTarget(instance, 1);
    return [];
  }
  const bandConfig = readInViewBandConfig();
  const useBand = touchOnly && options.touchAutoplay && bandConfig.enabled;
  const viewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          applyTarget(instance, 1);
          return;
        }
        instance.progress = 0;
        instance.target = 0;
      });
    },
    useBand
      ? { rootMargin: bandRootMargin(bandConfig), threshold: BAND_THRESHOLDS }
      : { threshold: IN_VIEW_THRESHOLD }
  );
  viewObserver.observe(options.host);
  return [() => viewObserver.disconnect()];
};

const bindTouchCentreBand = (
  instance: CanvasInstance,
  hoverTarget: Element,
  touchAutoplay: boolean
): Cleanup[] => {
  const bandConfig = readInViewBandConfig();
  if (!touchAutoplay || !bandConfig.enabled || typeof IntersectionObserver === "undefined") {
    return [];
  }
  const centreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => applyTarget(instance, entry.isIntersecting ? 1 : 0));
    },
    { rootMargin: bandRootMargin(bandConfig), threshold: BAND_THRESHOLDS }
  );
  centreObserver.observe(hoverTarget);
  return [() => centreObserver.disconnect()];
};

export const bindInputToInstance = (
  instance: CanvasInstance,
  options: InputBindingOptions
): Cleanup => {
  const hoverTarget: Element =
    options.host.closest(".kt-feature-card") ??
    options.host.closest(".wp-block-group") ??
    options.host;
  let inputCleanups: Cleanup[] = [];

  const releaseInput = (): void => {
    inputCleanups.forEach((cleanup) => cleanup());
    inputCleanups = [];
  };

  const bindInput = (touchOnly: boolean): void => {
    releaseInput();
    applyTarget(instance, 0);
    if (options.trigger === "in-view") {
      inputCleanups = bindInViewTrigger(instance, options, touchOnly);
    } else if (!touchOnly) {
      inputCleanups = bindHoverAndFocus(instance, hoverTarget);
    } else {
      inputCleanups = bindTouchCentreBand(instance, hoverTarget, options.touchAutoplay);
    }
  };

  const hoverQuery = window.matchMedia(HOVER_NONE_QUERY);
  bindInput(hoverQuery.matches);
  const onHoverQueryChange = (event: MediaQueryListEvent): void => bindInput(event.matches);
  hoverQuery.addEventListener?.("change", onHoverQueryChange);

  return () => {
    hoverQuery.removeEventListener?.("change", onHoverQueryChange);
    releaseInput();
  };
};
