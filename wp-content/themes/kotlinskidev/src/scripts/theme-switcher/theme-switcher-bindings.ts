import { trackEvent } from "../track-event";
import type { ThemeApplier } from "./theme-applier";
import type { ThemeSwitcherConfig } from "./theme-switcher-config";
import { PREFERS_DARK_QUERY, THEME_STORAGE_KEY, type ResolvedTheme } from "./initial-theme";

function persistAndTrack(theme: ResolvedTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  trackEvent("theme_mode_toggle", { mode: theme });
}

export function bindToggleChange(toggle: HTMLInputElement, applyTheme: ThemeApplier): void {
  toggle.addEventListener("change", function (this: HTMLInputElement) {
    const theme = this.checked ? "light" : "dark";
    applyTheme(theme);
    persistAndTrack(theme);
  });
}

export function bindKeyboardActivation(switcher: HTMLElement, toggle: HTMLInputElement): void {
  switcher.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle.click();
    }
  });
}

export function bindOperatingSystemThemeChange(
  config: ThemeSwitcherConfig,
  applyTheme: ThemeApplier
): void {
  const mediaQuery = window.matchMedia(PREFERS_DARK_QUERY);

  mediaQuery.addEventListener("change", (event: MediaQueryListEvent) => {
    if (localStorage.getItem(THEME_STORAGE_KEY) || config.defaultMode !== "auto") {
      return;
    }
    applyTheme(event.matches ? "dark" : "light");
  });
}
