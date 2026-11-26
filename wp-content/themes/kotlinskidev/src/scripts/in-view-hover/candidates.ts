import { readInViewBandConfig } from "@utils/in-view-band";
import { IN_VIEW_HOVER_SELECTOR } from "../in-view-hover-selector";
import { isEligible } from "./eligibility";

const hasEligibleAncestor = (element: Element, eligible: ReadonlySet<Element>): boolean => {
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (eligible.has(ancestor)) {
      return true;
    }
  }
  return false;
};

export const collectCandidates = (): Element[] => {
  const includeLinks = readInViewBandConfig().links;
  const eligible = Array.from(document.querySelectorAll(IN_VIEW_HOVER_SELECTOR)).filter((element) =>
    isEligible(element, includeLinks)
  );
  const eligibleSet = new Set(eligible);
  return eligible.filter((element) => !hasEligibleAncestor(element, eligibleSet));
};
