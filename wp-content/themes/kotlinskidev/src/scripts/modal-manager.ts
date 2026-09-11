import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const OWNER = "kt-modal";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
// 12 frames (~200ms) was not enough — confirmed live via a real Playwright wheel-scroll-then-click
// repro sampling window.scrollY every frame: the actual drift lands as a single, one-time step at
// ~290ms after the click (not a gradual animation, and it never recurs after that one step), which
// lines up with modal.scss's own --nav-reveal-duration (500ms, see nav.scss) fade-in most likely
// finishing enough of its visual settling to trigger a layout/ResizeObserver reaction around then.
// 40 frames (~650ms at 60fps) covers that with margin without guarding indefinitely.
const SCROLL_GUARD_FRAMES = 40;

let activeModal: HTMLElement | null = null;
let activeTrigger: HTMLElement | null = null;
let scrollYAtPointerDown: number | null = null;

// A page with several GSAP ScrollTrigger pinned sections sharing one .main-wrapper (this
// theme's own scroll-trigger-refresh.ts documents this exact setup as fragile against any
// refresh) can snap scrollY back to an earlier pin-spacer on a refresh triggered by something
// outside our own code path — GSAP's built-in resize-triggered auto-refresh, a third-party
// script reacting to the modal's DOM changes, etc. Re-asserting the target scrollY for a few
// frames after opening/closing catches that regardless of what actually triggers it, the same
// save-and-restore-if-changed pattern scroll-trigger-refresh.ts already uses around its own
// refresh() call — just extended across a short window since the disturbance isn't guaranteed
// to land on the very next frame.
function guardScrollPosition(targetY: number, framesRemaining: number): void {
  if (window.scrollY !== targetY) {
    // html has scroll-behavior:smooth theme-wide — the 2-arg window.scrollTo() form inherits
    // that and animates instead of snapping, leaving a real (if much smaller) residual gap on
    // the very next read. behavior:"instant" forces an immediate jump regardless.
    window.scrollTo({ left: window.scrollX, top: targetY, behavior: "instant" });
  }
  if (framesRemaining <= 0) {
    return;
  }
  requestAnimationFrame(() => guardScrollPosition(targetY, framesRemaining - 1));
}

function setBackgroundInert(modal: HTMLElement, isInert: boolean): void {
  Array.from(document.body.children).forEach((el) => {
    if (el === modal) {
      return;
    }
    if (isInert) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  });
}

function trapFocus(modal: HTMLElement, e: KeyboardEvent): void {
  const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const current = document.activeElement;

  if (e.shiftKey && current === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && current === last) {
    e.preventDefault();
    first.focus();
  }
}

function closeModal(): void {
  if (!activeModal) {
    return;
  }
  const scrollYBeforeClose = window.scrollY;
  setBackgroundInert(activeModal, false);
  activeModal.classList.remove("is-open");
  activeModal.setAttribute("aria-hidden", "true");
  unlockScroll(OWNER);
  if (activeTrigger?.isConnected) {
    activeTrigger.focus({ preventScroll: true });
  }
  activeModal = null;
  activeTrigger = null;
  guardScrollPosition(scrollYBeforeClose, SCROLL_GUARD_FRAMES);
}

function openModal(modal: HTMLElement, trigger: HTMLElement): void {
  const scrollYBeforeOpen = scrollYAtPointerDown ?? window.scrollY;
  scrollYAtPointerDown = null;
  closeAllExcept(closeModal);
  activeModal = modal;
  activeTrigger = trigger;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector<HTMLElement>(".kt-modal__close")?.focus({ preventScroll: true });
  setBackgroundInert(modal, true);
  lockScroll(OWNER);
  guardScrollPosition(scrollYBeforeOpen, SCROLL_GUARD_FRAMES);
}

export function initModalManager(): void {
  registerPanel(closeModal);

  // preventDefault() on mousedown blocks the browser's own native focus-assignment default
  // action for the clicked trigger — the standard technique for a control that manages its own
  // focus target, used here because that native action includes "scroll the about-to-be-focused
  // element into view", and a trigger sitting inside a GSAP ScrollTrigger pin (position: fixed,
  // .main-wrapper) can have that native scroll land somewhere real content genuinely extends to
  // but the user never asked to see. click still fires normally afterward (preventDefault on
  // mousedown never suppresses the following click) and openModal() moves focus to the modal's
  // own close button itself, so the trigger never needs native focus at all. Confirmed live via
  // a real Playwright wheel-scroll-then-click repro that this was still measurably happening
  // (a variable, non-zero scrollY drift) even after capturing scrollY as early as possible and
  // restoring it — jsdom/scrollTo-based reproductions never caught this, same "must be real
  // wheel scroll" gotcha documented in scroll-section-multi-pin.spec.ts for a different bug on
  // this same page shape. scrollYAtPointerDown is kept as a defense-in-depth snapshot for any
  // other disturbance guardScrollPosition() might still need to correct.
  document.addEventListener(
    "mousedown",
    (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-kt-modal-target], a[href^="#kt-modal-"]')) {
        scrollYAtPointerDown = window.scrollY;
        e.preventDefault();
      }
    },
    true
  );

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const trigger = target.closest<HTMLElement>('[data-kt-modal-target], a[href^="#kt-modal-"]');
    if (trigger) {
      const targetId =
        trigger.getAttribute("data-kt-modal-target") ?? trigger.getAttribute("href")!.slice(1);
      const modal = document.getElementById(targetId);
      if (modal) {
        e.preventDefault();
        openModal(modal, trigger);
      }
      return;
    }

    if (target.closest("[data-kt-modal-close]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.matches("[data-kt-modal-target]") && !target.matches("a, button")) {
        e.preventDefault();
        target.click();
      }
      return;
    }

    if (!activeModal) {
      return;
    }
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "Tab") {
      trapFocus(activeModal, e);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initModalManager);
} else {
  initModalManager();
}
