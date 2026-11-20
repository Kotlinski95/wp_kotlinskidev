import { closeAllExcept } from "@utils/panel-coordinator";
import {
  CLOSE_BUTTON_SELECTOR,
  MENU_OPEN_CLASS,
  NAVIGATION_SELECTOR,
  OPEN_BUTTON_SELECTOR,
  RESPONSIVE_CONTAINER_SELECTOR,
} from "./hamburger-selectors";
import { closeHamburger } from "./close-hamburger";

const bindOpenButton = (openButton: HTMLButtonElement): void => {
  const nav = openButton.closest(NAVIGATION_SELECTOR);
  const closeButton = nav?.querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR);
  if (closeButton) {
    openButton.insertAdjacentElement("afterend", closeButton);
    closeButton.addEventListener("mousedown", (event) => event.preventDefault());
  }

  openButton.addEventListener("click", () => {
    const isOpen = !!nav?.querySelector(`${RESPONSIVE_CONTAINER_SELECTOR}.${MENU_OPEN_CLASS}`);
    if (!isOpen) {
      closeAllExcept(closeHamburger);
    }
  });
};

export const bindOpenButtons = (): void => {
  document.querySelectorAll<HTMLButtonElement>(OPEN_BUTTON_SELECTOR).forEach(bindOpenButton);
};
