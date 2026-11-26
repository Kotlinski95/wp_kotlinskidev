import { getScrollTop, onScroll } from "./utils";

const STICKY_HEADER_CLASS = "header-sticky";
const BREADCRUMBS_HIDDEN_CLASS = "kt-breadcrumbs--hidden";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector<HTMLElement>("header");
  if (!header) {
    return;
  }

  const breadcrumbs = document.querySelector<HTMLElement>(".kt-breadcrumbs");
  let stickyThreshold: number | null = null;
  let frameId: number | null = null;

  const applyStickyState = (): void => {
    const scrollTop = getScrollTop();
    if (scrollTop > 0) {
      stickyThreshold ??= header.offsetHeight;
    }
    const isScrolledPastHeader = stickyThreshold !== null && scrollTop > stickyThreshold;
    header.classList.toggle(STICKY_HEADER_CLASS, isScrolledPastHeader);
    breadcrumbs?.classList.toggle(BREADCRUMBS_HIDDEN_CLASS, isScrolledPastHeader);
    frameId = null;
  };

  const onScrollUpdateStickyState = (): void => {
    if (frameId !== null) {
      return;
    }
    frameId = requestAnimationFrame(applyStickyState);
  };

  onScrollUpdateStickyState();
  onScroll(onScrollUpdateStickyState);
});
