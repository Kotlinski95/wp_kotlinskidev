(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const box = document.querySelector(".box");
    const ball = document.querySelector(".ball");
    const themeToggleButton = document.getElementById(
      "theme-toggle"
    ) as HTMLInputElement;
    if (!themeToggleButton) return;
    if (localStorage.getItem("theme") === "light") {
      document.body?.classList?.add("light-mode");
      document.documentElement.classList.add('light-mode');
      document.body?.classList?.remove("dark-mode");
      document.documentElement.classList.remove('dark-mode');
      themeToggleButton.checked = true;
      box?.setAttribute("style", "background-color:black; color:white;");
      ball?.setAttribute("style", "transform:translatex(0%);");
    } else {
      document.body?.classList?.add("dark-mode");
      document.documentElement.classList.add('dark-mode');
      document.body?.classList?.remove("light-mode");
      document.documentElement.classList.remove('light-mode');
      themeToggleButton.checked = false;
      box?.setAttribute("style", "background-color:white;");
      ball?.setAttribute("style", "transform:translatex(80%);");
    }

    themeToggleButton.addEventListener(
      "change",
      function (this: HTMLInputElement) {
        if (this.checked) {
          document.body?.classList?.add("light-mode");
          document.documentElement.classList.add('light-mode');
          document.body?.classList?.remove("dark-mode");
          document.documentElement.classList.remove('dark-mode');
          localStorage.setItem("theme", "light");

          box?.setAttribute("style", "background-color:black; color:white;");
          ball?.setAttribute("style", "transform:translatex(0%);");
        } else {
          document.body?.classList?.remove("light-mode");
          document.documentElement.classList.remove('light-mode');
          document.body?.classList?.add("dark-mode");
          document.documentElement.classList.add('dark-mode');
          localStorage.removeItem("theme");
          box?.setAttribute("style", "background-color:white;");
          ball?.setAttribute("style", "transform:translatex(80%);");
        }
      }
    );
  });
})();
