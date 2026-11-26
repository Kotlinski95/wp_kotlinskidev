import type { HeroSwiper } from "./hero-swiper";

interface PauseReasons {
  hovered: boolean;
  focused: boolean;
  pressed: boolean;
}

const isConsentDialogOpen = (): boolean =>
  document.documentElement.classList.contains("kt-cmplz-pending") ||
  document.querySelector(".cmplz-soft-cookiewall:not(.cmplz-dismissed)") !== null;

const hasPauseReason = (reasons: PauseReasons): boolean =>
  reasons.hovered || reasons.focused || reasons.pressed || isConsentDialogOpen();

const isPointerInside = (container: HTMLElement, pointerEvent: PointerEvent): boolean => {
  const rect = container.getBoundingClientRect();
  return (
    pointerEvent.clientX >= rect.left &&
    pointerEvent.clientX <= rect.right &&
    pointerEvent.clientY >= rect.top &&
    pointerEvent.clientY <= rect.bottom
  );
};

const wireHoverAndFocus = (
  container: HTMLElement,
  reasons: PauseReasons,
  evaluate: () => void
): void => {
  container.addEventListener("mouseenter", () => {
    reasons.hovered = true;
    evaluate();
  });

  container.addEventListener("mouseleave", () => {
    reasons.hovered = false;
    evaluate();
  });

  container.addEventListener("focusin", () => {
    reasons.focused = true;
    evaluate();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && container.contains(nextFocusedElement)) {
      return;
    }
    reasons.focused = false;
    evaluate();
  });
};

const wireConsentDialogEvents = (container: HTMLElement, evaluate: () => void): void => {
  const evaluateWhileConnected = () => {
    if (container.isConnected) {
      evaluate();
    }
  };
  const evaluateNextFrame = () => window.requestAnimationFrame(evaluateWhileConnected);
  document.addEventListener("cmplz_status_change", evaluateNextFrame);
  document.addEventListener("cmplz_cookie_warning_loaded", evaluateNextFrame);
  document.addEventListener("kt-cmplz-released", evaluateWhileConnected);
};

const wirePressStart = (
  container: HTMLElement,
  reasons: PauseReasons,
  evaluate: () => void
): void => {
  container.addEventListener("pointerdown", () => {
    reasons.pressed = true;
    evaluate();
  });
};

const wirePressRelease = (
  container: HTMLElement,
  reasons: PauseReasons,
  evaluate: () => void
): void => {
  const releasePress = (event: Event) => {
    if (!reasons.pressed) {
      return;
    }
    reasons.pressed = false;
    const pointerEvent = event as PointerEvent;
    if (!pointerEvent.pointerType || pointerEvent.pointerType === "mouse") {
      reasons.hovered = isPointerInside(container, pointerEvent);
    }
    evaluate();
  };
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);
};

export const wireAutoplayHoverPause = (el: HTMLElement, swiper: HeroSwiper): void => {
  const container = el.closest<HTMLElement>(".hero-carousel") ?? el;
  const reasons: PauseReasons = {
    hovered: container.matches(":hover"),
    focused: false,
    pressed: false,
  };

  const evaluate = () => {
    if (hasPauseReason(reasons)) {
      swiper.autoplay.pause();
    } else {
      swiper.autoplay.resume();
    }
  };

  swiper.on("autoplayResume", () => {
    if (hasPauseReason(reasons)) {
      swiper.autoplay.pause();
    }
  });

  wireHoverAndFocus(container, reasons, evaluate);
  wirePressStart(container, reasons, evaluate);
  wireConsentDialogEvents(container, evaluate);
  if (isConsentDialogOpen()) {
    evaluate();
  }
  wirePressRelease(container, reasons, evaluate);
};
