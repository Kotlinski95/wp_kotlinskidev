export interface SpeedDialController {
  root: HTMLElement;
  toggle: HTMLButtonElement;
  list: HTMLElement;
  isOpen: () => boolean;
  open: () => void;
  close: (options?: { returnFocus?: boolean }) => void;
  destroy: () => void;
}

const CLOSE_FALLBACK_MS = 300;

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const createController = (
  root: HTMLElement,
  toggle: HTMLButtonElement,
  list: HTMLElement
): SpeedDialController => {
  let opened = false;
  let frame = 0;
  let fallbackTimer = 0;
  let finishClose: (() => void) | null = null;

  const cancelPendingClose = (): void => {
    window.clearTimeout(fallbackTimer);
    if (finishClose) {
      list.removeEventListener("transitionend", finishClose);
      finishClose = null;
    }
  };

  const completeClose = (): void => {
    cancelPendingClose();
    list.hidden = true;
    root.classList.remove("is-open");
  };

  const open = (): void => {
    if (opened) {
      return;
    }
    opened = true;
    cancelPendingClose();
    list.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    document.addEventListener("pointerdown", onOutsidePointerDown);
    frame = window.requestAnimationFrame(() => root.classList.add("is-visible"));
  };

  const close = ({ returnFocus = false }: { returnFocus?: boolean } = {}): void => {
    if (!opened) {
      return;
    }
    opened = false;
    document.removeEventListener("pointerdown", onOutsidePointerDown);
    window.cancelAnimationFrame(frame);
    root.classList.remove("is-visible");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) {
      toggle.focus();
    }
    if (prefersReducedMotion() || root.classList.contains("kt-speed-dial--motion-none")) {
      completeClose();
      return;
    }
    finishClose = (event?: Event) => {
      if (!event || event.target === list) {
        completeClose();
      }
    };
    list.addEventListener("transitionend", finishClose as EventListener);
    fallbackTimer = window.setTimeout(completeClose, CLOSE_FALLBACK_MS);
  };

  function onOutsidePointerDown(event: Event): void {
    if (!root.contains(event.target as Node)) {
      close();
    }
  }

  const onToggleClick = (): void => (opened ? close() : open());

  const onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (next && !root.contains(next)) {
      close();
    }
  };

  const onListClick = (event: Event): void => {
    const action = (event.target as Element).closest("a[href], button");
    if (action && root.dataset.closeOnAction !== "false") {
      close({ returnFocus: !action.hasAttribute("data-kt-speed-dial-a11y") });
    }
  };

  const onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      close();
    }
  };

  toggle.addEventListener("click", onToggleClick);
  root.addEventListener("focusout", onFocusOut);
  list.addEventListener("click", onListClick);
  window.addEventListener("pageshow", onPageShow);

  const destroy = (): void => {
    cancelPendingClose();
    window.cancelAnimationFrame(frame);
    document.removeEventListener("pointerdown", onOutsidePointerDown);
    toggle.removeEventListener("click", onToggleClick);
    root.removeEventListener("focusout", onFocusOut);
    list.removeEventListener("click", onListClick);
    window.removeEventListener("pageshow", onPageShow);
  };

  return { root, toggle, list, isOpen: () => opened, open, close, destroy };
};
