import { getBreakpoints } from "../utils";
import type { DeviceType, ThemeMode } from "./types";

export const isElementInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const getDeviceType = (): DeviceType => {
  const breakpoints = getBreakpoints();
  if (typeof window.matchMedia === "function") {
    if (window.matchMedia(`(max-width: ${breakpoints.mobile_max}px)`).matches) {
      return "mobile";
    }
    return window.matchMedia(`(max-width: ${breakpoints.tablet_max}px)`).matches
      ? "tablet"
      : "desktop";
  }
  const width = window.innerWidth;
  if (width <= breakpoints.mobile_max) {
    return "mobile";
  }
  if (width <= breakpoints.tablet_max) {
    return "tablet";
  }
  return "desktop";
};

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getThemePreference = (): ThemeMode => {
  const saved = localStorage.getItem("theme-preference") as ThemeMode;
  if (saved) {
    return saved;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};
