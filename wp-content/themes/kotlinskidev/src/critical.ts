import "./critical.scss";
import "./scripts/theme-switcher";
import "./scripts/restoration";
import "./scripts/utils";

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loaded");
});

(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-mode");
    document.body?.classList?.add("light-mode");
  } else {
    document.documentElement.classList.add("dark-mode");
    document.body?.classList?.add("dark-mode");
  }
})();
