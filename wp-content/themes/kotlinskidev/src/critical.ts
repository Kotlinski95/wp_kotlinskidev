import "./critical.scss";
import "./scripts/theme-switcher";
import "./scripts/restoration";
import "./scripts/utils";
import "./scripts/sticky-header";

const markViewTransition = (event: Event): void => {
  if ((event as Event & { viewTransition?: unknown }).viewTransition) {
    document.documentElement.classList.add("kt-vt");
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
