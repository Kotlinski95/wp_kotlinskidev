export type ThemeSwitcherConfig = {
  enabled: boolean;
  defaultMode: string;
};

type ThemeSwitcherConfigWindow = Window & { kotlinskidevTheme?: ThemeSwitcherConfig };

const DEFAULT_THEME_SWITCHER_CONFIG: ThemeSwitcherConfig = { enabled: true, defaultMode: "auto" };

export function readThemeSwitcherConfig(): ThemeSwitcherConfig {
  return (window as ThemeSwitcherConfigWindow).kotlinskidevTheme ?? DEFAULT_THEME_SWITCHER_CONFIG;
}
