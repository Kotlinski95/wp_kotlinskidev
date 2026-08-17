import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const OWNER = "kt-modal";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let activeModal: HTMLElement | null = null;
let activeTrigger: HTMLElement | null = null;

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
  setBackgroundInert(activeModal, false);
  activeModal.classList.remove("is-open");
  activeModal.setAttribute("aria-hidden", "true");
  unlockScroll(OWNER);
  if (activeTrigger?.isConnected) {
    activeTrigger.focus();
  }
  activeModal = null;
  activeTrigger = null;
}

function openModal(modal: HTMLElement, trigger: HTMLElement): void {
  closeAllExcept(closeModal);
  activeModal = modal;
  activeTrigger = trigger;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setBackgroundInert(modal, true);
  lockScroll(OWNER);
  modal.querySelector<HTMLElement>(".kt-modal__close")?.focus();
}

document.addEventListener("DOMContentLoaded", () => {
  registerPanel(closeModal);

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
});
