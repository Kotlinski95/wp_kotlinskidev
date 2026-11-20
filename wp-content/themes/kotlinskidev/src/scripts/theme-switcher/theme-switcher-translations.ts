export type ThemeSwitcherTranslations = {
  lightMode: string;
  darkMode: string;
};

type ThemeSwitcherTranslationsWindow = Window & {
  i18n?: { themeSwitcher?: ThemeSwitcherTranslations };
};

const DEFAULT_THEME_SWITCHER_TRANSLATIONS: ThemeSwitcherTranslations = {
  lightMode: "Switch between dark and light mode (currently light mode)",
  darkMode: "Switch between dark and light mode (currently dark mode)",
};

export function readThemeSwitcherTranslations(): ThemeSwitcherTranslations {
  return (
    (window as unknown as ThemeSwitcherTranslationsWindow).i18n?.themeSwitcher ||
    DEFAULT_THEME_SWITCHER_TRANSLATIONS
  );
}
