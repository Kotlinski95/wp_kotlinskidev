import { getScrollTop } from "./utils";
import { isHistoryOrReloadNavigation, readNavigationType } from "./restoration/navigation-type";
import { restoreScrollUntilStable } from "./restoration/restore-scroll";
import { readStoredPosition, writeStoredPosition } from "./restoration/stored-position";

const onPageHide = (): void => {
  writeStoredPosition(getScrollTop());
};

const onPageShow = (event: PageTransitionEvent): void => {
  if (event.persisted) {
    return;
  }
  if (!isHistoryOrReloadNavigation(readNavigationType())) {
    return;
  }
  const position = readStoredPosition();
  if (position !== null) {
    restoreScrollUntilStable(position);
  }
};

window.addEventListener("pagehide", onPageHide);
window.addEventListener("pageshow", onPageShow);
