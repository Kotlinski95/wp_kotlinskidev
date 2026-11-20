import type { ResolvedTheme } from "./initial-theme";
import type { ThemeSwitcherTranslations } from "./theme-switcher-translations";

export type ThemeSwitcherElements = {
  toggle: HTMLInputElement;
  lightIcon: HTMLElement | null;
  darkIcon: HTMLElement | null;
};

export type ThemeApplier = (theme: ResolvedTheme) => void;

const LIGHT_MODE_CLASS = "light-mode";
const DARK_MODE_CLASS = "dark-mode";

function setIconTitles(
  { lightIcon, darkIcon }: ThemeSwitcherElements,
  translations: ThemeSwitcherTranslations,
  isLightMode: boolean
): void {
  if (!lightIcon || !darkIcon) {
    return;
  }
  if (isLightMode) {
    lightIcon.setAttribute("title", translations.lightMode);
    darkIcon.removeAttribute("title");
  } else {
    darkIcon.setAttribute("title", translations.darkMode);
    lightIcon.removeAttribute("title");
  }
}

function swapModeClasses(addedClass: string, removedClass: string): void {
  document.body?.classList?.add(addedClass);
  document.documentElement.classList.add(addedClass);
  document.body?.classList?.remove(removedClass);
  document.documentElement.classList.remove(removedClass);
}

export function createThemeApplier(
  elements: ThemeSwitcherElements,
  translations: ThemeSwitcherTranslations
): ThemeApplier {
  return (theme) => {
    const isLightMode = theme === "light";
    if (isLightMode) {
      swapModeClasses(LIGHT_MODE_CLASS, DARK_MODE_CLASS);
    } else {
      swapModeClasses(DARK_MODE_CLASS, LIGHT_MODE_CLASS);
    }
    elements.toggle.checked = isLightMode;
    setIconTitles(elements, translations, isLightMode);
  };
}
