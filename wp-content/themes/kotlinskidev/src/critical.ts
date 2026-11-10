import "./critical.scss";
import "./scripts/theme-switcher";
import "./scripts/restoration";
import "./scripts/utils";
import "./scripts/app-shell";
import "./scripts/sticky-header";
import { initNavSolidTransition } from "./scripts/nav-solid-transition";
import { initBlockingStylesheets } from "./scripts/blocking-stylesheets";
import { revealAboveFoldForViewTransition } from "./scripts/view-transition-reveal";

initBlockingStylesheets();
initNavSolidTransition();

const markViewTransition = (event: Event): void => {
  const viewTransition = (event as Event & { viewTransition?: unknown }).viewTransition;
  if (viewTransition) {
    document.documentElement.classList.add("kt-vt");
    revealAboveFoldForViewTransition(viewTransition);
  }
};

try {
  window.addEventListener("pagereveal", markViewTransition);
} catch {
  document.documentElement.classList.remove("kt-vt");
}

const markLoaded = (): void => {
  document.body.classList.add("loaded");
};

if (document.readyState === "loading") {
  document.addEventListener("readystatechange", () => {
    if (document.readyState !== "loading") {
      markLoaded();
    }
  });
  document.addEventListener("DOMContentLoaded", markLoaded);
} else {
  markLoaded();
}

document.addEventListener("DOMContentLoaded", function () {
  const mode = document.documentElement.classList.contains("light-mode")
    ? "light-mode"
    : "dark-mode";
  document.body.classList.add(mode);
});
