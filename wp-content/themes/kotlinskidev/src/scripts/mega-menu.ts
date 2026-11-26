import {
  BACKDROP_SELECTOR,
  ITEM_SELECTOR,
  NAV_SELECTOR,
  PANEL_SELECTOR,
} from "./mega-menu/mega-menu-constants";
import { createMegaMenuController } from "./mega-menu/mega-menu-controller";
import { bindItem } from "./mega-menu/item-bindings";
import {
  bindBackdrop,
  bindEscapeKey,
  bindFocusOut,
  bindNavPointerEvents,
} from "./mega-menu/nav-bindings";
import { bindPanel } from "./mega-menu/panel-bindings";

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector<HTMLElement>(NAV_SELECTOR);
  if (!nav) {
    return;
  }

  const controller = createMegaMenuController(nav);

  nav
    .querySelectorAll<HTMLElement>(ITEM_SELECTOR)
    .forEach((item) => bindItem(nav, item, controller));
  nav
    .querySelectorAll<HTMLElement>(PANEL_SELECTOR)
    .forEach((panel) => bindPanel(nav, panel, controller));
  bindNavPointerEvents(nav, controller);
  bindBackdrop(nav.querySelector<HTMLElement>(BACKDROP_SELECTOR), controller);
  bindFocusOut(nav, controller);
  bindEscapeKey(nav, controller);
});
