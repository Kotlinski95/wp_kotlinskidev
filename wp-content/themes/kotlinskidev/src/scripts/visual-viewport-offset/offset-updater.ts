import { rafThrottle } from "../utils";
import { applyBottomOffset, readBottomOffset } from "./bottom-offset";

const PAGE_SETTLE_MS = 1500;

export interface OffsetUpdater {
  update: () => void;
  cancelPendingUpdate: () => void;
}

export const createOffsetUpdater = (viewport: VisualViewport): OffsetUpdater => {
  let settleTimer: number | undefined;

  const cancelPendingUpdate = (): void => {
    if (settleTimer !== undefined) {
      window.clearTimeout(settleTimer);
      settleTimer = undefined;
    }
  };

  const update = rafThrottle(() => {
    const offset = readBottomOffset(viewport);
    const remainingSettleMs = PAGE_SETTLE_MS - performance.now();

    cancelPendingUpdate();
    if (offset === 0 || remainingSettleMs <= 0) {
      applyBottomOffset(offset);
      return;
    }
    settleTimer = window.setTimeout(update, remainingSettleMs);
  });

  return { update, cancelPendingUpdate };
};
