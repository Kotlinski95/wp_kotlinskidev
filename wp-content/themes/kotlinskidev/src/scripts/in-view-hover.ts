import { IN_VIEW_HOVER_SELECTOR, isLinkLike } from "./in-view-hover-selector";
import {
  observeCentreBand,
  readInViewBandConfig,
  type CentreBandController,
} from "@utils/in-view-band";
import { setActive, syncActiveOuters } from "./in-view-hover/active-state";
import { collectCandidates } from "./in-view-hover/candidates";
import { hasRelevantMutation } from "./in-view-hover/relevant-mutations";
import { createRescanScheduler } from "./in-view-hover/rescan-scheduler";

export { IN_VIEW_HOVER_SELECTOR, isLinkLike };

const HOVER_NONE_QUERY = "(hover: none)";

export const initInViewHover = (): (() => void) => {
  const hoverQuery = window.matchMedia(HOVER_NONE_QUERY);
  let controller: CentreBandController | null = null;
  let mutationObserver: MutationObserver | null = null;

  const scan = (): void => {
    if (controller) {
      controller.update(collectCandidates());
      syncActiveOuters();
      return;
    }
    controller = observeCentreBand(collectCandidates(), setActive, { exclusive: true });
  };

  const rescanScheduler = createRescanScheduler(scan);

  const onMutations = (records: MutationRecord[]): void => {
    if (hasRelevantMutation(records)) {
      rescanScheduler.schedule();
    }
  };

  const stop = (): void => {
    controller?.disconnect();
    controller = null;
    mutationObserver?.disconnect();
    mutationObserver = null;
    rescanScheduler.cancel();
  };

  const isSupported = (): boolean =>
    hoverQuery.matches &&
    readInViewBandConfig().enabled &&
    typeof IntersectionObserver !== "undefined";

  const start = (): void => {
    stop();
    if (!isSupported()) {
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
