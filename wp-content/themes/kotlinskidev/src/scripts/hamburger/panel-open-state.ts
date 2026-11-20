import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import { loadDeferredImages } from "@utils/load-deferred-images";
import { dispatchNavPanelOpen, dispatchNavPanelClose } from "@utils/nav-reveal-events";
import {
  CLOSE_BUTTON_SELECTOR,
  LOCK_OWNER,
  MENU_OPEN_CLASS,
  NAVIGATION_SELECTOR,
  PANEL_ANIMATING_CLASS,
} from "./hamburger-selectors";
import { collapseAllSubmenuToggles } from "./submenu-tabindex";

const redirectInitialFocusToCloseButton = (
  container: HTMLElement,
  closeButton: HTMLButtonElement | null | undefined
): void => {
  closeButton?.focus();
  const onInitialFocusIn = (event: FocusEvent): void => {
    container.removeEventListener("focusin", onInitialFocusIn);
    if (event.target !== closeButton) {
      closeButton?.focus();
    }
  };
  container.addEventListener("focusin", onInitialFocusIn);
};

const onPanelOpened = (container: HTMLElement): void => {
  lockScroll(LOCK_OWNER);
  loadDeferredImages(container);
  dispatchNavPanelOpen(container);
  container.classList.add(PANEL_ANIMATING_CLASS);
  collapseAllSubmenuToggles(container);
  const closeButton = container
    .closest(NAVIGATION_SELECTOR)
    ?.querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR);
  redirectInitialFocusToCloseButton(container, closeButton);
};

const onPanelClosed = (container: HTMLElement): void => {
  unlockScroll(LOCK_OWNER);
  dispatchNavPanelClose(container);
  container.classList.add(PANEL_ANIMATING_CLASS);
};

const clearAnimatingClassOnWidthTransitionEnd = (container: HTMLElement): void => {
  container.addEventListener("transitionend", (event) => {
    if (event.target === container && event.propertyName === "max-width") {
      container.classList.remove(PANEL_ANIMATING_CLASS);
    }
  });
};

const observeOpenStateChanges = (container: HTMLElement, wasOpenAtStart: boolean): void => {
  let wasOpen = wasOpenAtStart;
  const observer = new MutationObserver(() => {
    const isOpen = container.classList.contains(MENU_OPEN_CLASS);
    if (isOpen && !wasOpen) {
      onPanelOpened(container);
    } else if (!isOpen && wasOpen) {
      onPanelClosed(container);
    }
    wasOpen = isOpen;
  });
  observer.observe(container, { attributes: true, attributeFilter: ["class"] });
};

export const watchResponsiveContainer = (container: HTMLElement): void => {
  const isOpenAtStart = container.classList.contains(MENU_OPEN_CLASS);
  if (isOpenAtStart) {
    lockScroll(LOCK_OWNER);
  }
  clearAnimatingClassOnWidthTransitionEnd(container);
  observeOpenStateChanges(container, isOpenAtStart);
};
