export const OPEN_DELAY = 500;
export const SWITCH_DELAY = 500;
export const CLOSE_DELAY = 500;
export const LOCK_OWNER = "mega-menu";
export const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export const NAV_SELECTOR = ".kt-mega-nav";
export const ITEM_SELECTOR = ".kt-mega-nav__item";
export const PANEL_SELECTOR = ".kt-mega-nav__panel";
export const BACKDROP_SELECTOR = ".kt-mega-nav__backdrop";
export const LINK_SELECTOR = ".kt-mega-nav__link";

export const itemSelectorFor = (panelId: string): string =>
  `${ITEM_SELECTOR}[data-panel="${panelId}"]`;
export const panelSelectorFor = (panelId: string): string =>
  `${PANEL_SELECTOR}[data-panel="${panelId}"]`;
