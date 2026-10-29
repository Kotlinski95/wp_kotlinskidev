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

function findRevealElements(container: HTMLElement): HTMLElement[] {
  const descendants = Array.from(container.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  return container.matches(REVEAL_SELECTOR) ? [container, ...descendants] : descendants;
}

document.addEventListener(NAV_PANEL_OPEN_EVENT, (e) => {
  const { container } = (e as CustomEvent<NavPanelEventDetail>).detail;
  const elements = findRevealElements(container);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elements.forEach((el) => {
        el.classList.add("visible");
      });
    });
  });
});

document.addEventListener(NAV_PANEL_CLOSE_EVENT, (e) => {
  const { container } = (e as CustomEvent<NavPanelEventDetail>).detail;
  findRevealElements(container).forEach((el) => {
    el.classList.remove("visible");
  });
});
