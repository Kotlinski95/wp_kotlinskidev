const INTERACTION_GUARD_MS = 1200;
const VISIBILITY_MARGIN_PX = 8;
const INTERACTION_EVENTS = ["wheel", "touchstart", "touchmove", "pointerdown"] as const;

export interface ListScroller {
  scrollToLink: (link: HTMLElement | null | undefined, options?: { force?: boolean }) => void;
}

export function computeListScrollTop(container: HTMLElement, link: HTMLElement): number | null {
  const containerRect = container.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const visible =
    linkRect.top >= containerRect.top + VISIBILITY_MARGIN_PX &&
    linkRect.bottom <= containerRect.bottom - VISIBILITY_MARGIN_PX;
  if (visible) {
    return null;
  }

  const linkTop = linkRect.top - containerRect.top + container.scrollTop;
  const centred = linkTop - (container.clientHeight - linkRect.height) / 2;
  const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
  return Math.min(maxTop, Math.max(0, centred));
}

function isHovered(container: HTMLElement): boolean {
  try {
    return container.matches(":hover");
  } catch {
    return false;
  }
}

export function createListScroller(
  container: HTMLElement,
  prefersReducedMotion: () => boolean
): ListScroller {
  let lastInteraction = Number.NEGATIVE_INFINITY;
  const markInteraction = (): void => {
    lastInteraction = Date.now();
  };
  INTERACTION_EVENTS.forEach((type) => {
    container.addEventListener(type, markInteraction, { passive: true });
  });

  return {
    scrollToLink(link, options = {}) {
      if (!link || container.clientHeight <= 0) {
        return;
      }
      if (
        !options.force &&
        (isHovered(container) || Date.now() - lastInteraction < INTERACTION_GUARD_MS)
      ) {
        return;
      }

      const top = computeListScrollTop(container, link);
      if (top === null) {
        return;
      }

      container.scrollTo({
        top,
        behavior: options.force || prefersReducedMotion() ? "auto" : "smooth",
      });
    },
  };
}
