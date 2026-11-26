import type { ThemeSwitcherConfig } from "./theme-switcher-config";

export const THEME_STORAGE_KEY = "theme";
export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

export type ResolvedTheme = "light" | "dark";

function isResolvedTheme(value: string | null): value is ResolvedTheme {
  return value === "light" || value === "dark";
}

export function resolveInitialTheme(config: ThemeSwitcherConfig): ResolvedTheme {
  const storedTheme = config.enabled ? localStorage.getItem(THEME_STORAGE_KEY) : null;
  const systemPrefersDark = window.matchMedia(PREFERS_DARK_QUERY).matches;

  const explicitTheme = [storedTheme, config.defaultMode].find(isResolvedTheme);
  if (explicitTheme) {
    return explicitTheme;
  }
  return systemPrefersDark ? "dark" : "light";
}
