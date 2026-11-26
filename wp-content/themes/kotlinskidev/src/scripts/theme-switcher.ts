import { createThemeApplier } from "./theme-switcher/theme-applier";
import {
  bindKeyboardActivation,
  bindOperatingSystemThemeChange,
  bindToggleChange,
} from "./theme-switcher/theme-switcher-bindings";
import { readThemeSwitcherConfig } from "./theme-switcher/theme-switcher-config";
import { readThemeSwitcherTranslations } from "./theme-switcher/theme-switcher-translations";
import { resolveInitialTheme } from "./theme-switcher/initial-theme";

function initThemeSwitcher(): void {
  const toggle = document.getElementById("theme-toggle") as HTMLInputElement | null;
  if (!toggle) {
    return;
  }

  const config = readThemeSwitcherConfig();
  const switcher = document.querySelector(".theme-switcher") as HTMLElement;
  const lightIcon = document.querySelector<HTMLElement>(".icon.light");
  const darkIcon = document.querySelector<HTMLElement>(".icon.dark");

  const applyTheme = createThemeApplier(
    { toggle, lightIcon, darkIcon },
    readThemeSwitcherTranslations()
  );

  applyTheme(resolveInitialTheme(config));

  bindToggleChange(toggle, applyTheme);
  bindKeyboardActivation(switcher, toggle);
  bindOperatingSystemThemeChange(config, applyTheme);
}

document.addEventListener("DOMContentLoaded", initThemeSwitcher);
