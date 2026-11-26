import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import { trackEvent } from "./track-event";
import { getScrollTop } from "./utils";
import { setBackgroundInert } from "./modal-manager/background-inert";
import { trapFocus } from "./modal-manager/focus-trap";
import { SCROLL_GUARD_FRAMES, guardScrollPosition } from "./modal-manager/scroll-guard";

const OWNER = "kt-modal";
const TRIGGER_SELECTOR = '[data-kt-modal-target], a[href^="#kt-modal-"]';
const CLOSE_SELECTOR = "[data-kt-modal-close]";
const CLOSE_BUTTON_SELECTOR = ".kt-modal__close";
const OPEN_CLASS = "is-open";

let activeModal: HTMLElement | null = null;
let activeTrigger: HTMLElement | null = null;
let scrollYAtPointerDown: number | null = null;

const closeModal = (): void => {
  if (!activeModal) {
    return;
  }
  const scrollYBeforeClose = getScrollTop();
  const modal = activeModal;
  const trigger = activeTrigger;
  setBackgroundInert(activeModal, false);
  activeModal.classList.remove(OPEN_CLASS);
  activeModal.setAttribute("aria-hidden", "true");
  unlockScroll(OWNER);
  if (activeTrigger?.isConnected) {
    activeTrigger.focus({ preventScroll: true });
  }
  activeModal = null;
  activeTrigger = null;
  guardScrollPosition(scrollYBeforeClose, SCROLL_GUARD_FRAMES);
  document.dispatchEvent(new CustomEvent("kt-modal:close", { detail: { modal, trigger } }));
};

const openModal = (modal: HTMLElement, trigger: HTMLElement): void => {
  const scrollYBeforeOpen = scrollYAtPointerDown ?? getScrollTop();
  scrollYAtPointerDown = null;
  closeAllExcept(closeModal);
  activeModal = modal;
  activeTrigger = trigger;
  modal.classList.add(OPEN_CLASS);
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector<HTMLElement>(CLOSE_BUTTON_SELECTOR)?.focus({ preventScroll: true });
  setBackgroundInert(modal, true);
  lockScroll(OWNER);
  guardScrollPosition(scrollYBeforeOpen, SCROLL_GUARD_FRAMES);
  document.dispatchEvent(new CustomEvent("kt-modal:open", { detail: { modal, trigger } }));
  trackEvent("modal_open", { modal_id: modal.id });
};

const onTriggerMouseDown = (e: MouseEvent): void => {
  const target = e.target as HTMLElement;
  if (target.closest(TRIGGER_SELECTOR)) {
    scrollYAtPointerDown = getScrollTop();
    e.preventDefault();
  }
};

const resolveTargetModal = (trigger: HTMLElement): HTMLElement | null => {
  const targetId =
    trigger.getAttribute("data-kt-modal-target") ?? trigger.getAttribute("href")!.slice(1);
  return document.getElementById(targetId);
};

const onDocumentClick = (e: MouseEvent): void => {
  const target = e.target as HTMLElement;

  const trigger = target.closest<HTMLElement>(TRIGGER_SELECTOR);
  if (trigger) {
    const modal = resolveTargetModal(trigger);
    if (modal) {
      e.preventDefault();
      openModal(modal, trigger);
    }
    return;
  }

  if (target.closest(CLOSE_SELECTOR)) {
    closeModal();
  }
};

const activateTriggerFromKeyboard = (e: KeyboardEvent): void => {
  const target = e.target as HTMLElement;
  if (target.matches("[data-kt-modal-target]") && !target.matches("a, button")) {
    e.preventDefault();
    target.click();
  }
};

const onDocumentKeyDown = (e: KeyboardEvent): void => {
  if (e.key === "Enter" || e.key === " ") {
    activateTriggerFromKeyboard(e);
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
};

export const initModalManager = (): void => {
  registerPanel(closeModal);
  document.addEventListener("mousedown", onTriggerMouseDown, true);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeyDown);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initModalManager);
} else {
  initModalManager();
}
