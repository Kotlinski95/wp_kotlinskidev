import { CLOSE_BUTTON_SELECTOR, OPEN_NAVIGATION_SELECTOR } from "./hamburger-selectors";

export const findOpenNavigations = (): NodeListOf<HTMLElement> =>
  document.querySelectorAll<HTMLElement>(OPEN_NAVIGATION_SELECTOR);

export const closeHamburger = (): void => {
  findOpenNavigations().forEach((nav) => {
    nav.querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR)?.click();
  });
};

export const onDocumentEscapeKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    closeHamburger();
  }
};

export const onDocumentClickOutsideOpenNavigation = (event: MouseEvent): void => {
  const openNavigations = findOpenNavigations();
  if (!openNavigations.length) {
    return;
  }
  const target = event.target as Element;
  const clickedInsideOpenNavigation = Array.from(openNavigations).some((nav) =>
    nav.contains(target)
  );
  if (!clickedInsideOpenNavigation) {
    closeHamburger();
  }
};
