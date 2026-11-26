import {
  NAVIGATION_ITEM_SELECTOR,
  SUBMENU_CONTAINER_SELECTOR,
  SUBMENU_TOGGLE_SELECTOR,
} from "./hamburger-selectors";
import { setSubmenuTabbable } from "./submenu-tabindex";

const TOGGLE_PARENT_SELECTOR = `${SUBMENU_CONTAINER_SELECTOR}, .wp-block-navigation__container`;
const EXPANDED_SIBLING_TOGGLES_SELECTOR = `:scope > ${NAVIGATION_ITEM_SELECTOR} > ${SUBMENU_TOGGLE_SELECTOR}[aria-expanded='true']`;

const collapseExpandedSiblings = (toggle: HTMLButtonElement): void => {
  toggle
    .closest(TOGGLE_PARENT_SELECTOR)
    ?.querySelectorAll<HTMLButtonElement>(EXPANDED_SIBLING_TOGGLES_SELECTOR)
    .forEach((sibling) => {
      if (sibling !== toggle) {
        sibling.setAttribute("aria-expanded", "false");
        setSubmenuTabbable(sibling, false);
      }
    });
};

const onSubmenuToggleClick = (event: MouseEvent): void => {
  const toggle = (event.target as Element).closest<HTMLButtonElement>(SUBMENU_TOGGLE_SELECTOR);
  if (!toggle) {
    return;
  }
  event.stopImmediatePropagation();
  const wasExpanded = toggle.getAttribute("aria-expanded") === "true";
  collapseExpandedSiblings(toggle);
  toggle.setAttribute("aria-expanded", wasExpanded ? "false" : "true");
  setSubmenuTabbable(toggle, !wasExpanded);
};

export const listenForSubmenuToggleClicks = (): void => {
  document.addEventListener("click", onSubmenuToggleClick, { capture: true });
};
