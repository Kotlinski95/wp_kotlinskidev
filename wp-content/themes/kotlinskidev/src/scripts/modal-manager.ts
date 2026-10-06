import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import { trackEvent } from "./track-event";

const OWNER = "kt-modal";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
// Confirmed live: scrollY drift from the fade-in's layout reaction lands as a single ~290ms step, so 40 frames covers it with margin.
const SCROLL_GUARD_FRAMES = 40;

let activeModal: HTMLElement | null = null;
let activeTrigger: HTMLElement | null = null;
let scrollYAtPointerDown: number | null = null;

// Re-asserts target scrollY for a few frames since an external reaction (GSAP auto-refresh, etc.) can shift it unpredictably after open/close.
function guardScrollPosition(targetY: number, framesRemaining: number): void {
  if (window.scrollY !== targetY) {
    // behavior:"instant" avoids the 2-arg scrollTo()'s inherited theme-wide smooth-scroll animation, which would leave a residual gap.
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
  const modal = activeModal;
  const trigger = activeTrigger;
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
  document.dispatchEvent(new CustomEvent("kt-modal:close", { detail: { modal, trigger } }));
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
  document.dispatchEvent(new CustomEvent("kt-modal:open", { detail: { modal, trigger } }));
  trackEvent("modal_open", { modal_id: modal.id });
}

export function initModalManager(): void {
  registerPanel(closeModal);

  // preventDefault() on mousedown blocks native focus-scroll (which can land inside a GSAP-pinned trigger) since openModal() focuses the modal's own close button instead; click still fires normally after.
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
