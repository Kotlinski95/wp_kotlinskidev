type ThemeSwitcherConfig = {
  enabled: boolean;
  defaultMode: string;
};

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const config: ThemeSwitcherConfig = (
      window as unknown as { kotlinskidevTheme?: ThemeSwitcherConfig }
    ).kotlinskidevTheme ?? { enabled: true, defaultMode: "auto" };
    const themeToggleButton = document.getElementById("theme-toggle") as HTMLInputElement;
    const themeSwitcher = document.querySelector(".theme-switcher") as HTMLInputElement;
    const lightIcon = document.querySelector(".icon.light") as HTMLElement;
    const darkIcon = document.querySelector(".icon.dark") as HTMLElement;

    if (!themeToggleButton) return;

    const translations = (window as any).i18n?.themeSwitcher || {
      lightMode: "Switch between dark and light mode (currently light mode)",
      darkMode: "Switch between dark and light mode (currently dark mode)",
    };

    const updateIconTitles = (isLightMode: boolean) => {
      if (lightIcon && darkIcon) {
        if (isLightMode) {
          lightIcon.setAttribute("title", translations.lightMode);
          darkIcon.removeAttribute("title");
        } else {
          darkIcon.setAttribute("title", translations.darkMode);
          lightIcon.removeAttribute("title");
        }
      }
    };

    const applyLightTheme = () => {
      document.body?.classList?.add("light-mode");
      document.documentElement.classList.add("light-mode");
      document.body?.classList?.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
      themeToggleButton.checked = true;
      updateIconTitles(true);
    };

    const applyDarkTheme = () => {
      document.body?.classList?.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
      document.body?.classList?.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
      themeToggleButton.checked = false;
      updateIconTitles(false);
    };

    const storedTheme = config.enabled ? localStorage.getItem("theme") : null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "light") {
      applyLightTheme();
    } else if (storedTheme === "dark") {
      applyDarkTheme();
    } else if (config.defaultMode === "light") {
      applyLightTheme();
    } else if (config.defaultMode === "dark") {
      applyDarkTheme();
    } else if (systemPrefersDark) {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }

    themeToggleButton.addEventListener("change", function (this: HTMLInputElement) {
      if (this.checked) {
        applyLightTheme();
        localStorage.setItem("theme", "light");
      } else {
        applyDarkTheme();
        localStorage.setItem("theme", "dark");
      }
    });

    // Listen for Enter key on theme toggle (for accessibility)
    themeSwitcher.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        themeToggleButton.click();
      }
    });

    // Listen for OS theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleOSThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme") || config.defaultMode !== "auto") {
        return;
      }
      if (e.matches) {
        applyDarkTheme();
      } else {
        applyLightTheme();
      }
    };

    // Add event listener for OS theme changes
    mediaQuery.addEventListener("change", handleOSThemeChange);
  });
})();
