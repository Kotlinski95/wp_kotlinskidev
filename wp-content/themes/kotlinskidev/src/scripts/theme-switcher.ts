(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const themeToggleButton = document.getElementById(
      "theme-toggle"
    ) as HTMLInputElement;
    const lightIcon = document.querySelector('.icon.light') as HTMLElement;
    const darkIcon = document.querySelector('.icon.dark') as HTMLElement;
    
    if (!themeToggleButton) return;

    // Get translations from WordPress i18n system
    const translations = (window as any).i18n?.themeSwitcher || {
      lightMode: "Switch between dark and light mode (currently light mode)",
      darkMode: "Switch between dark and light mode (currently dark mode)"
    };

    // Update icon titles based on current theme
    const updateIconTitles = (isLightMode: boolean) => {
      if (lightIcon && darkIcon) {
        if (isLightMode) {
          lightIcon.setAttribute('title', translations.lightMode);
          darkIcon.removeAttribute('title');
        } else {
          darkIcon.setAttribute('title', translations.darkMode);
          lightIcon.removeAttribute('title');
        }
      }
    };

    // Function to apply light theme
    const applyLightTheme = () => {
      document.body?.classList?.add("light-mode");
      document.documentElement.classList.add("light-mode");
      document.body?.classList?.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
      themeToggleButton.checked = true;
      updateIconTitles(true);
    };

    // Function to apply dark theme
    const applyDarkTheme = () => {
      document.body?.classList?.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
      document.body?.classList?.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
      themeToggleButton.checked = false;
      updateIconTitles(false);
    };

    // Check for stored theme preference or detect system preference
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (storedTheme === "light") {
      applyLightTheme();
    } else if (storedTheme === "dark") {
      applyDarkTheme();
    } else {
      // No stored preference, use system preference
      if (systemPrefersDark) {
        applyDarkTheme();
      } else {
        applyLightTheme();
      }
    }

    themeToggleButton.addEventListener(
      "change",
      function (this: HTMLInputElement) {
        if (this.checked) {
          applyLightTheme();
          localStorage.setItem("theme", "light");
        } else {
          applyDarkTheme();
          localStorage.setItem("theme", "dark");
        }
      }
    );

    // Listen for OS theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleOSThemeChange = (e: MediaQueryListEvent) => {
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
