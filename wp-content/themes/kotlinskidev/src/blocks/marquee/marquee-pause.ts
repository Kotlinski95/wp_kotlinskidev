import { onModalTriggerInside } from "@utils/modal-trigger-events";
import { onScroll } from "../../scripts/utils";

interface PauseReasons {
  hovered: boolean;
  focused: boolean;
  pressed: boolean;
  modalOpen: boolean;
}

const hasPauseReason = (reasons: PauseReasons): boolean =>
  reasons.hovered || reasons.focused || reasons.pressed || reasons.modalOpen;

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

const wirePress = (container: HTMLElement, reasons: PauseReasons, evaluate: () => void): void => {
  container.addEventListener("pointerdown", () => {
    reasons.pressed = true;
    evaluate();
  });

  const releasePress = () => {
    if (!reasons.pressed) {
      return;
    }
    reasons.pressed = false;
    evaluate();
  };
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);
};

const wireModalPause = (
  container: HTMLElement,
  reasons: PauseReasons,
  evaluate: () => void
): void => {
  onModalTriggerInside(container, "kt-modal:open", () => {
    reasons.modalOpen = true;
    evaluate();
  });

  onModalTriggerInside(container, "kt-modal:close", () => {
    reasons.modalOpen = false;
    reasons.focused = false;
    evaluate();
  });
};

export const wireMarqueePauseResume = (container: HTMLElement, track: HTMLElement): void => {
  const reasons: PauseReasons = {
    hovered: false,
    focused: false,
    pressed: false,
    modalOpen: false,
  };
  let isPaused = false;

  const evaluate = () => {
    const shouldPause = hasPauseReason(reasons);
    if (shouldPause === isPaused) {
      return;
    }
    isPaused = shouldPause;
    track.classList.toggle("is-paused", isPaused);
  };

  wireHoverAndFocus(container, reasons, evaluate);
  wirePress(container, reasons, evaluate);
  wireModalPause(container, reasons, evaluate);

  onScroll(() => {
    if (isPaused && !reasons.hovered && !reasons.pressed && !reasons.modalOpen) {
      reasons.focused = false;
      evaluate();
    }
  });
};
