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

export function getScrollTop(): number {
  return document.body.scrollTop || window.scrollY || 0;
}

export function scrollTo(top: number, behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top, behavior });
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
  return () => window.removeEventListener("scroll", callback);
}

export function setScrollBehavior(behavior: ScrollBehavior): void {
  document.documentElement.style.scrollBehavior = behavior;
  document.body.style.scrollBehavior = behavior;
}
