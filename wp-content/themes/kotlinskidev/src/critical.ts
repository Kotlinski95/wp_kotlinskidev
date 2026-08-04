import "./critical.scss";
import "./scripts/theme-switcher";
import "./scripts/restoration";
import "./scripts/utils";
import "./scripts/sticky-header";

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loaded");
});

document.addEventListener("DOMContentLoaded", function () {
  const mode = document.documentElement.classList.contains("light-mode")
    ? "light-mode"
    : "dark-mode";
  document.body.classList.add(mode);
});
