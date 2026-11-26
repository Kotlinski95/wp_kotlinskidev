import { IN_VIEW_HOVER_SELECTOR, isLinkLike } from "./in-view-hover-selector";
import {
  observeCentreBand,
  readInViewBandConfig,
  type CentreBandController,
} from "@utils/in-view-band";

export { IN_VIEW_HOVER_SELECTOR, isLinkLike };

const IN_VIEW_CLASS = "is-in-view-hover";
const OPT_OUT_SELECTOR = ".kt-in-view-hover-off";
const HOVER_NONE_QUERY = "(hover: none)";
const RESCAN_DEBOUNCE_MS = 150;

const CAROUSEL_SELECTOR =
  ".swiper, .kt-slider, .wp-block-kotlinskidev-slider, .wp-block-wpe-slider";
const SCROLLING_OVERFLOW = /^(auto|scroll)$/;

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

const setActive = (element: Element, active: boolean): void => {
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

const isInsideHorizontalScroller = (element: Element): boolean => {
  if (element.closest(CAROUSEL_SELECTOR)) {
    return true;
  }
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (SCROLLING_OVERFLOW.test(window.getComputedStyle(ancestor).overflowX)) {
      return true;
    }
  }
  return false;
};

const isRelevantNode = (node: Node): boolean =>
  node instanceof Element &&
  (node.matches(IN_VIEW_HOVER_SELECTOR) || node.querySelector(IN_VIEW_HOVER_SELECTOR) !== null);

const hasRelevantMutation = (records: MutationRecord[]): boolean =>
  records.some(
    (record) =>
      Array.from(record.addedNodes).some(isRelevantNode) ||
      Array.from(record.removedNodes).some(isRelevantNode)
  );

const isEligible = (element: Element, includeLinks: boolean): boolean =>
  !element.closest(OPT_OUT_SELECTOR) &&
  (includeLinks || !isLinkLike(element)) &&
  !isInsideHorizontalScroller(element);

const collectCandidates = (): Element[] => {
  const includeLinks = readInViewBandConfig().links;
  const eligible = Array.from(document.querySelectorAll(IN_VIEW_HOVER_SELECTOR)).filter((element) =>
    isEligible(element, includeLinks)
  );
  const eligibleSet = new Set(eligible);
  return eligible.filter((element) => {
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (eligibleSet.has(ancestor)) {
        return false;
      }
    }
    return true;
  });
};

export const initInViewHover = (): (() => void) => {
  const hoverQuery = window.matchMedia(HOVER_NONE_QUERY);
  let controller: CentreBandController | null = null;
  let mutationObserver: MutationObserver | null = null;
  let rescanTimer: ReturnType<typeof setTimeout> | null = null;

  const stop = (): void => {
    controller?.disconnect();
    controller = null;
    mutationObserver?.disconnect();
    mutationObserver = null;
    if (rescanTimer !== null) {
      clearTimeout(rescanTimer);
      rescanTimer = null;
    }
  };

  const scan = (): void => {
    if (controller) {
      controller.update(collectCandidates());
      activeOuters.forEach(syncDescendants);
      return;
    }
    controller = observeCentreBand(collectCandidates(), setActive, { exclusive: true });
  };

  const onMutations = (records: MutationRecord[]): void => {
    if (hasRelevantMutation(records)) {
      scheduleRescan();
    }
  };

  const scheduleRescan = (): void => {
    if (rescanTimer !== null) {
      clearTimeout(rescanTimer);
    }
    rescanTimer = setTimeout(() => {
      rescanTimer = null;
      scan();
    }, RESCAN_DEBOUNCE_MS);
  };

  const start = (): void => {
    stop();
    if (
      !hoverQuery.matches ||
      !readInViewBandConfig().enabled ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    scan();
    mutationObserver = new MutationObserver(onMutations);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  };

  const onHoverQueryChange = (): void => start();
  hoverQuery.addEventListener?.("change", onHoverQueryChange);
  start();

  return () => {
    hoverQuery.removeEventListener?.("change", onHoverQueryChange);
    stop();
  };
};

initInViewHover();
