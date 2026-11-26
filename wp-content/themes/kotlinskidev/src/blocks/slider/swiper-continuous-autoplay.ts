import type Swiper from "swiper";
import { onModalTriggerInside } from "@utils/modal-trigger-events";
import { onScroll } from "../../scripts/utils";
import { resyncActiveIndexOnAutoplayResume } from "./swiper-autoplay";
import type { AutoplayPace } from "./swiper-catch-up";
import {
  createEvaluate,
  createInitialState,
  hasNoGenuinePauseReasonLeft,
  type ContinuousAutoplayState,
} from "./swiper-pause-state";
import { startStallWatchdog } from "./swiper-stall-watchdog";
import { freezeAtCurrentPosition } from "./swiper-translate";

interface ContinuousAutoplayContext {
  container: HTMLElement;
  swiper: Swiper;
  pace: AutoplayPace;
  state: ContinuousAutoplayState;
  evaluate: () => void;
}

function wireHoverAndFocus({ container, state, evaluate }: ContinuousAutoplayContext): void {
  container.addEventListener("mouseenter", () => {
    state.reasons.hovered = true;
    evaluate();
  });

  container.addEventListener("mouseleave", () => {
    state.reasons.hovered = false;
    evaluate();
  });

  container.addEventListener("focusin", () => {
    state.reasons.focused = true;
    evaluate();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && container.contains(nextFocusedElement)) {
      return;
    }
    state.reasons.focused = false;
    if (nextFocusedElement instanceof Node) {
      state.reasons.touchPinned = false;
    }
    evaluate();
  });
}

function wireModalPause({ container, state, evaluate }: ContinuousAutoplayContext): void {
  onModalTriggerInside(container, "kt-modal:open", () => {
    state.reasons.modalOpen = true;
    evaluate();
  });

  onModalTriggerInside(container, "kt-modal:close", () => {
    state.reasons.modalOpen = false;
    state.reasons.focused = false;
    evaluate();
  });
}

function wireScrollResume({ state, evaluate }: ContinuousAutoplayContext): void {
  onScroll(() => {
    if (state.isPaused && hasNoGenuinePauseReasonLeft(state.reasons)) {
      state.reasons.focused = false;
      evaluate();
    }
  });
}

function wirePointerPress(context: ContinuousAutoplayContext): void {
  const { container, swiper, state, evaluate } = context;
  container.addEventListener("pointerdown", (event) => {
    state.touchStarted = Boolean(event.pointerType) && event.pointerType !== "mouse";
    state.reasons.pressed = true;
    evaluate();
    if (state.touchStarted && swiper.params.loop && typeof swiper.loopFix === "function") {
      swiper.loopFix({ byMousewheel: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      !state.reasons.touchPinned ||
      (event.target instanceof Node && container.contains(event.target))
    ) {
      return;
    }
    state.reasons.touchPinned = false;
    state.reasons.focused = false;
    state.reasons.hovered = false;
    evaluate();
  });
}

function isPointerInside(container: HTMLElement, pointerEvent: PointerEvent): boolean {
  const rect = container.getBoundingClientRect();
  return (
    pointerEvent.clientX >= rect.left &&
    pointerEvent.clientX <= rect.right &&
    pointerEvent.clientY >= rect.top &&
    pointerEvent.clientY <= rect.bottom
  );
}

function createReleasePress({
  container,
  swiper,
  state,
  evaluate,
}: ContinuousAutoplayContext): (event: Event) => void {
  return (event) => {
    if (!state.reasons.pressed) {
      return;
    }
    state.reasons.pressed = false;
    const pointerEvent = event as PointerEvent;
    if (state.touchStarted && event.type === "pointerup") {
      state.reasons.touchPinned = true;
    }
    state.touchStarted = false;
    if (!pointerEvent.pointerType || pointerEvent.pointerType === "mouse") {
      state.reasons.hovered = isPointerInside(container, pointerEvent);
    } else {
      state.reasons.hovered = false;
    }
    swiper.autoplay.pause();
    if (state.isPaused) {
      state.resume.midTransition = false;
      state.resume.dragEndedTranslateX = freezeAtCurrentPosition(swiper);
    }
    evaluate();
  };
}

function wirePinnedTouchEnd({ swiper, state }: ContinuousAutoplayContext): void {
  const holdPinnedPosition = () => {
    if (!state.reasons.touchPinned || swiper.destroyed) {
      return;
    }
    swiper.autoplay.pause();
    state.resume.dragEndedTranslateX = freezeAtCurrentPosition(swiper);
  };
  swiper.on("touchEnd", () => {
    if (!state.reasons.touchPinned) {
      return;
    }
    const autoplayState = swiper.autoplay as { running: boolean };
    const wasRunning = autoplayState.running;
    autoplayState.running = false;
    setTimeout(() => {
      autoplayState.running = wasRunning;
      holdPinnedPosition();
    }, 0);
  });
}

function startAutoplayWithWatchdog({ swiper, pace, state }: ContinuousAutoplayContext): void {
  swiper.autoplay.start();
  swiper.on(
    "destroy",
    startStallWatchdog(swiper, pace, () => state.isPaused)
  );
}

function startWhenVisible(context: ContinuousAutoplayContext): void {
  if (typeof IntersectionObserver === "undefined") {
    startAutoplayWithWatchdog(context);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      startAutoplayWithWatchdog(context);
      obs.unobserve(entry.target);
    });
  });
  observer.observe(context.container);
}

export function wireContinuousAutoplay(
  container: HTMLElement,
  swiper: Swiper,
  pace: AutoplayPace
): void {
  resyncActiveIndexOnAutoplayResume(swiper);

  const state = createInitialState();
  const evaluate = createEvaluate(swiper, state, pace);
  const context: ContinuousAutoplayContext = { container, swiper, pace, state, evaluate };

  wireHoverAndFocus(context);
  wireModalPause(context);
  wireScrollResume(context);
  wirePointerPress(context);
  wirePinnedTouchEnd(context);
  const releasePress = createReleasePress(context);
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);

  startWhenVisible(context);
}
