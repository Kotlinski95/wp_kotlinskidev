import { getScrollTop, onAppShellChange, onScroll, rafThrottle, scrollTo } from "./utils";

export const SCROLL_CONTAINER_CHANGE_EVENT = "kt:scroll-container-change";

export function initAppShell(): void {
  let lastScrollTop = 0;

  onScroll(
    rafThrottle(() => {
      lastScrollTop = getScrollTop();
    })
  );

  onAppShellChange((active) => {
    scrollTo(lastScrollTop, "instant");
    window.dispatchEvent(
      new CustomEvent<{ active: boolean }>(SCROLL_CONTAINER_CHANGE_EVENT, { detail: { active } })
    );
  });
}

initAppShell();
