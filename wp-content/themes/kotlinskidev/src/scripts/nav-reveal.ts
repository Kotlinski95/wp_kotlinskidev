import {
  NAV_PANEL_OPEN_EVENT,
  NAV_PANEL_CLOSE_EVENT,
  type NavPanelEventDetail,
} from "@utils/nav-reveal-events";

const REVEAL_SELECTOR = [
  ".appear-on-reveal",
  ".fade-in-on-reveal",
  ".fade-up-on-reveal",
  ".fade-left-on-reveal",
  ".fade-right-on-reveal",
  ".flip-up-on-reveal",
  ".flip-down-on-reveal",
  ".flip-left-on-reveal",
  ".flip-right-on-reveal",
].join(",");

const REVEALED_CLASS = "visible";

function findRevealElements(container: HTMLElement): HTMLElement[] {
  const descendants = Array.from(container.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  return container.matches(REVEAL_SELECTOR) ? [container, ...descendants] : descendants;
}

const readPanelContainer = (event: Event): HTMLElement =>
  (event as CustomEvent<NavPanelEventDetail>).detail.container;

const onNavPanelOpen = (event: Event): void => {
  const elements = findRevealElements(readPanelContainer(event));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elements.forEach((element) => {
        element.classList.add(REVEALED_CLASS);
      });
    });
  });
};

const onNavPanelClose = (event: Event): void => {
  findRevealElements(readPanelContainer(event)).forEach((element) => {
    element.classList.remove(REVEALED_CLASS);
  });
};

document.addEventListener(NAV_PANEL_OPEN_EVENT, onNavPanelOpen);
document.addEventListener(NAV_PANEL_CLOSE_EVENT, onNavPanelClose);
