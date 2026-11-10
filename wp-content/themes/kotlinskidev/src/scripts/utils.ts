export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number | undefined;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

export type ThemeBreakpoints = {
  mobile_max: number;
  tablet_min: number;
  tablet_max: number;
  desktop_min: number;
  large: number;
};

const defaultBreakpoints: ThemeBreakpoints = {
  mobile_max: 781,
  tablet_min: 782,
  tablet_max: 1023,
  desktop_min: 1024,
  large: 1200,
};

export function getBreakpoints(): ThemeBreakpoints {
  return (
    (window as unknown as { kotlinskiTheme?: { breakpoints?: ThemeBreakpoints } }).kotlinskiTheme
      ?.breakpoints ?? defaultBreakpoints
  );
}

export type ThemeScrollOffsets = {
  desktop: number;
  mobile: number;
};

const defaultScrollOffsets: ThemeScrollOffsets = {
  desktop: 75,
  mobile: 0,
};

export function getScrollOffsets(): ThemeScrollOffsets {
  return (
    (window as unknown as { kotlinskiTheme?: { scrollOffsets?: ThemeScrollOffsets } })
      .kotlinskiTheme?.scrollOffsets ?? defaultScrollOffsets
  );
}

/**
 * Check if current viewport width is considered mobile
 * @return true if viewport is below the desktop breakpoint
 */
export function isMobile(): boolean {
  return window.innerWidth < getBreakpoints().desktop_min;
}

/**
 * Execute callback on screen size changes (mobile/desktop transitions)
 * @param callback   Function to call with isMobile state
 * @param debounceMs Debounce delay in milliseconds (default: 150)
 * @return Cleanup function to remove listener
 */
export function onScreenSizeChange(
  callback: (isMobile: boolean) => void,
  debounceMs: number = 150
): () => void {
  const handleResize = () => {
    callback(isMobile());
  };

  const debouncedResize = debounce(handleResize, debounceMs);

  window.addEventListener("resize", debouncedResize, { passive: true });

  return () => {
    window.removeEventListener("resize", debouncedResize);
  };
}

/**
 * Initialize functionality only on mobile devices
 * @param onMobile  Function to call when mobile
 * @param onDesktop Optional function to call when desktop
 */
export function initMobileOnly(onMobile: () => void, onDesktop?: () => void): void {
  const handleScreenSize = (mobile: boolean) => {
    if (mobile) {
      onMobile();
    } else if (onDesktop) {
      onDesktop();
    }
  };

  handleScreenSize(isMobile());
  onScreenSizeChange(handleScreenSize);
}

export const APP_SHELL_MEDIA_QUERY = "screen and (max-width: 64rem)";

const SCROLL_CONTAINER_SELECTOR = ".wp-site-blocks";

let cachedMatchMedia: typeof window.matchMedia | null = null;
let cachedAppShellQuery: MediaQueryList | null = null;
let cachedScrollContainer: HTMLElement | null = null;

function getAppShellQuery(): MediaQueryList | null {
  if (typeof window.matchMedia !== "function") {
    return null;
  }
  if (cachedMatchMedia !== window.matchMedia) {
    cachedMatchMedia = window.matchMedia;
    cachedAppShellQuery = window.matchMedia(APP_SHELL_MEDIA_QUERY);
  }
  return cachedAppShellQuery;
}

export function isAppShellActive(): boolean {
  return (
    document.body?.classList.contains("kt-app-shell") === true &&
    getAppShellQuery()?.matches === true
  );
}

export function getScrollContainer(): HTMLElement | null {
  if (!isAppShellActive()) {
    return null;
  }
  if (!cachedScrollContainer || !cachedScrollContainer.isConnected) {
    cachedScrollContainer = document.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
  }
  return cachedScrollContainer;
}

export function getScrollTop(): number {
  const container = getScrollContainer();
  if (container) {
    return container.scrollTop;
  }
  return document.body?.scrollTop || window.scrollY || 0;
}

export function getScrollViewportHeight(): number {
  return getScrollContainer()?.clientHeight ?? window.innerHeight;
}

export function getScrollHeight(): number {
  return getScrollContainer()?.scrollHeight ?? document.documentElement.scrollHeight;
}

export function getMaxScrollTop(): number {
  return Math.max(0, getScrollHeight() - getScrollViewportHeight());
}

export function getElementScrollTop(element: Element): number {
  const container = getScrollContainer();
  const rectTop = element.getBoundingClientRect().top;
  if (container) {
    return rectTop + container.scrollTop - container.getBoundingClientRect().top;
  }
  return rectTop + (window.scrollY || 0);
}

export function scrollTo(top: number, behavior: ScrollBehavior = "smooth") {
  const container = getScrollContainer();
  if (container) {
    container.scrollTo({ top, behavior });
    return;
  }
  window.scrollTo({ top, behavior });
}

// Uses `window`, not a module-scoped variable — separate bundles/chunks have no guaranteed shared module scope, confirmed live with a closure-variable version having zero effect.
declare global {
  interface Window {
    kotlinskidevProgrammaticScrollActive?: boolean;
  }
}

export function beginProgrammaticScroll(): void {
  window.kotlinskidevProgrammaticScrollActive = true;
}

export function endProgrammaticScroll(): void {
  window.kotlinskidevProgrammaticScrollActive = false;
}

export function isProgrammaticScrollActive(): boolean {
  return window.kotlinskidevProgrammaticScrollActive === true;
}

export function rafThrottle<A extends unknown[]>(func: (...args: A) => void): (...args: A) => void {
  let ticking = false;
  return (...args: A) => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      func(...args);
      ticking = false;
    });
  };
}

export function onScroll(callback: () => void): () => void {
  window.addEventListener("scroll", callback, { passive: true });
  let boundContainer: HTMLElement | null = null;
  let removed = false;

  const bindContainer = (): void => {
    if (removed) {
      return;
    }
    boundContainer = document.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
    boundContainer?.addEventListener("scroll", callback, { passive: true });
  };

  if (document.querySelector(SCROLL_CONTAINER_SELECTOR)) {
    bindContainer();
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindContainer, { once: true });
  }

  return () => {
    removed = true;
    window.removeEventListener("scroll", callback);
    document.removeEventListener("DOMContentLoaded", bindContainer);
    boundContainer?.removeEventListener("scroll", callback);
  };
}

export function onAppShellChange(callback: (active: boolean) => void): () => void {
  const query = getAppShellQuery();
  if (!query) {
    return () => undefined;
  }
  const handleChange = (): void => callback(isAppShellActive());
  query.addEventListener("change", handleChange);
  return () => query.removeEventListener("change", handleChange);
}

export function setScrollBehavior(behavior: ScrollBehavior): void {
  document.documentElement.style.scrollBehavior = behavior;
  document.body.style.scrollBehavior = behavior;
  const container = document.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
  if (container) {
    container.style.scrollBehavior = behavior;
  }
}
