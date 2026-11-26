import { registerPanel } from "@utils/panel-coordinator";
import {
  closeHamburger,
  onDocumentClickOutsideOpenNavigation,
  onDocumentEscapeKeydown,
} from "./hamburger/close-hamburger";
import { RESPONSIVE_CONTAINER_SELECTOR } from "./hamburger/hamburger-selectors";
import { bindOpenButtons } from "./hamburger/open-button";
import { watchResponsiveContainer } from "./hamburger/panel-open-state";
import { listenForSubmenuToggleClicks } from "./hamburger/submenu-toggle-click";
import {
  hideCoveredParentLinks,
  syncSubmenuTabindexWithAriaState,
} from "./hamburger/submenu-tabindex";

document.addEventListener("DOMContentLoaded", () => {
  syncSubmenuTabindexWithAriaState();
  hideCoveredParentLinks();
  document
    .querySelectorAll<HTMLElement>(RESPONSIVE_CONTAINER_SELECTOR)
    .forEach(watchResponsiveContainer);

  registerPanel(closeHamburger);
  document.addEventListener("keydown", onDocumentEscapeKeydown);
  document.addEventListener("click", onDocumentClickOutsideOpenNavigation);
  bindOpenButtons();
  listenForSubmenuToggleClicks();
});
