import { FOCUSABLE_SELECTOR, LINK_SELECTOR, itemSelectorFor } from "./mega-menu-constants";
import type { MegaMenuController } from "./mega-menu-controller";

export const bindPanel = (
  nav: HTMLElement,
  panel: HTMLElement,
  controller: MegaMenuController
): void => {
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
      return;
    }
    const trigger = nav.querySelector<HTMLElement>(
      `${itemSelectorFor(String(panel.dataset.panel))} ${LINK_SELECTOR}`
    );
    if (!trigger) {
      return;
    }

    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (event.shiftKey && focusables[0] === event.target) {
      event.preventDefault();
      trigger.focus();
    } else if (!event.shiftKey && focusables[focusables.length - 1] === event.target) {
      event.preventDefault();
      controller.closeAll();
      trigger.focus();
    }
  });

  panel.addEventListener("mouseenter", () => {
    controller.cancelClose();
    controller.cancelSwitch();
  });
  panel.addEventListener("mouseleave", controller.scheduleClose);
};
