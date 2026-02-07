export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number | undefined;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

export const MOBILE_BREAKPOINT = 1024;

/**
 * Check if current viewport width is considered mobile
 * @returns true if viewport is below mobile breakpoint
 */
export function isMobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Execute callback on screen size changes (mobile/desktop transitions)
 * @param callback Function to call with isMobile state
 * @param debounceMs Debounce delay in milliseconds (default: 150)
 * @returns Cleanup function to remove listener
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
 * @param onMobile Function to call when mobile
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
