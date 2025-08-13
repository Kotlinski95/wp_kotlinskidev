(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const box = document.querySelector(".box");
    const ball = document.querySelector(".ball");
    const themeToggleButton = document.getElementById(
      "theme-toggle"
    ) as HTMLInputElement;
    if (!themeToggleButton) return;
    
    // Function to apply light theme
    const applyLightTheme = () => {
      document.body?.classList?.add("light-mode");
      document.documentElement.classList.add('light-mode');
      document.body?.classList?.remove("dark-mode");
      document.documentElement.classList.remove('dark-mode');
      themeToggleButton.checked = true;
      box?.setAttribute("style", "background-color:black; color:white;");
      ball?.setAttribute("style", "transform:translatex(0%);");
    };
    
    // Function to apply dark theme
    const applyDarkTheme = () => {
      document.body?.classList?.add("dark-mode");
      document.documentElement.classList.add('dark-mode');
      document.body?.classList?.remove("light-mode");
      document.documentElement.classList.remove('light-mode');
      themeToggleButton.checked = false;
      box?.setAttribute("style", "background-color:white;");
      ball?.setAttribute("style", "transform:translatex(80%);");
    };
    
    // Check for stored theme preference or detect system preference
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
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
  });
})();
