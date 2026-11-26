import {
  NAVIGATION_ITEM_SELECTOR,
  SUBMENU_CONTAINER_SELECTOR,
  SUBMENU_TOGGLE_SELECTOR,
} from "./hamburger-selectors";

const DIRECT_CHILD_FOCUS_TARGETS_SELECTOR = [
  `:scope > ${NAVIGATION_ITEM_SELECTOR} > .wp-block-navigation-item__content`,
  `:scope > ${NAVIGATION_ITEM_SELECTOR} > ${SUBMENU_TOGGLE_SELECTOR}`,
].join(", ");
const PARENT_ITEMS_IN_PANEL_SELECTOR = `.wp-block-navigation__responsive-container-content ${NAVIGATION_ITEM_SELECTOR}.has-child`;
const PARENT_LINK_SELECTOR = ":scope > .wp-block-navigation-item__content";
const PARENT_TOGGLE_SELECTOR = `:scope > ${SUBMENU_TOGGLE_SELECTOR}`;

const findSubmenuContainer = (toggle: HTMLButtonElement): HTMLElement | null =>
  toggle
    .closest(NAVIGATION_ITEM_SELECTOR)
    ?.querySelector<HTMLElement>(`:scope > ${SUBMENU_CONTAINER_SELECTOR}`) ?? null;

const collapseSubmenuTree = (submenu: HTMLElement): void => {
  submenu
    .querySelectorAll<HTMLElement>("a, button")
    .forEach((element) => element.setAttribute("tabindex", "-1"));
  submenu
    .querySelectorAll<HTMLButtonElement>(SUBMENU_TOGGLE_SELECTOR)
    .forEach((nestedToggle) => nestedToggle.setAttribute("aria-expanded", "false"));
};

export const setSubmenuTabbable = (toggle: HTMLButtonElement, expanded: boolean): void => {
  const submenu = findSubmenuContainer(toggle);
  if (!submenu) {
    return;
  }
  if (!expanded) {
    collapseSubmenuTree(submenu);
    return;
  }
  submenu
    .querySelectorAll<HTMLElement>(DIRECT_CHILD_FOCUS_TARGETS_SELECTOR)
    .forEach((element) => element.setAttribute("tabindex", "0"));
};

export const hideCoveredParentLinks = (): void => {
  document.querySelectorAll<HTMLElement>(PARENT_ITEMS_IN_PANEL_SELECTOR).forEach((item) => {
    const link = item.querySelector<HTMLElement>(PARENT_LINK_SELECTOR);
    const toggle = item.querySelector(PARENT_TOGGLE_SELECTOR);
    if (!link || !toggle) {
      return;
    }
    link.setAttribute("tabindex", "-1");
    link.setAttribute("aria-hidden", "true");
  });
};

export const collapseAllSubmenuToggles = (scope: ParentNode): void => {
  scope.querySelectorAll<HTMLButtonElement>(SUBMENU_TOGGLE_SELECTOR).forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
    setSubmenuTabbable(toggle, false);
  });
};

export const syncSubmenuTabindexWithAriaState = (): void => {
  document
    .querySelectorAll<HTMLButtonElement>(SUBMENU_TOGGLE_SELECTOR)
    .forEach((toggle) =>
      setSubmenuTabbable(toggle, toggle.getAttribute("aria-expanded") === "true")
    );
};
