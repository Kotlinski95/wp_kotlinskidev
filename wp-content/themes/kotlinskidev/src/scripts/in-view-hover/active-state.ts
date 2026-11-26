import { readInViewBandConfig } from "@utils/in-view-band";
import { IN_VIEW_HOVER_SELECTOR } from "../in-view-hover-selector";
import { isEligible } from "./eligibility";

const IN_VIEW_CLASS = "is-in-view-hover";
const GLOW_SELECTOR = ".has-enhanced-hover-glow";

const activeOuters = new Set<Element>();

const applyState = (element: Element, active: boolean): void => {
  element.classList.toggle(IN_VIEW_CLASS, active);
  if (!(element instanceof HTMLElement) || !element.matches(GLOW_SELECTOR)) {
    return;
  }
  if (!active) {
    element.style.removeProperty("--kt-glow-x");
    element.style.removeProperty("--kt-glow-y");
    return;
  }
  const rect = element.getBoundingClientRect();
  element.style.setProperty("--kt-glow-x", `${rect.width / 2}px`);
  element.style.setProperty("--kt-glow-y", `${rect.height / 2}px`);
};

const syncDescendants = (outer: Element): void => {
  const includeLinks = readInViewBandConfig().links;
  outer.querySelectorAll(IN_VIEW_HOVER_SELECTOR).forEach((element) => {
    if (!element.classList.contains(IN_VIEW_CLASS) && isEligible(element, includeLinks)) {
      applyState(element, true);
    }
  });
};

export const syncActiveOuters = (): void => {
  activeOuters.forEach(syncDescendants);
};

export const setActive = (element: Element, active: boolean): void => {
  applyState(element, active);
  if (active) {
    activeOuters.add(element);
    syncDescendants(element);
    return;
  }
  activeOuters.delete(element);
  element.querySelectorAll(IN_VIEW_HOVER_SELECTOR).forEach((descendant) => {
    applyState(descendant, false);
  });
};
