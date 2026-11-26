import { trackEvent } from "./track-event";

declare global {
  interface Window {
    i18n?: {
      general?: {
        read_more?: string;
        read_less?: string;
      };
    };
  }
}

const CLAMPED_PARAGRAPH_CLASS = "kt-line-clamp";
const TOGGLE_SELECTOR = ".kt-line-clamp-toggle";
const EXPANDED_CLASS = "kt-line-clamp--expanded";
const TOGGLE_HIDDEN_CLASS = "kt-line-clamp-toggle--hidden";
const OVERFLOW_TOLERANCE_PX = 1;

const getLabel = (key: "read_more" | "read_less", fallback: string): string =>
  window.i18n?.general?.[key] || fallback;

const isOverflowing = (paragraph: HTMLElement): boolean =>
  paragraph.scrollHeight > paragraph.clientHeight + OVERFLOW_TOLERANCE_PX;

const syncToggleVisibility = (paragraph: HTMLElement, toggle: HTMLElement): void => {
  const expanded = paragraph.classList.contains(EXPANDED_CLASS);
  if (expanded) {
    toggle.classList.remove(TOGGLE_HIDDEN_CLASS);
    return;
  }
  toggle.classList.toggle(TOGGLE_HIDDEN_CLASS, !isOverflowing(paragraph));
};

const onToggleClick = (paragraph: HTMLElement, toggle: HTMLElement): void => {
  const expanded = paragraph.classList.toggle(EXPANDED_CLASS);
  toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  toggle.textContent = expanded
    ? getLabel("read_less", "Read less")
    : getLabel("read_more", "Read more");
  trackEvent("read_more_click", { action: expanded ? "expand" : "collapse" });
};

const keepToggleVisibilityInSync = (paragraph: HTMLElement, toggle: HTMLElement): void => {
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(() => syncToggleVisibility(paragraph, toggle));
    observer.observe(paragraph);
    return;
  }
  syncToggleVisibility(paragraph, toggle);
  window.addEventListener("resize", () => syncToggleVisibility(paragraph, toggle));
};

const bindToggle = (toggle: HTMLElement): void => {
  const paragraph = toggle.previousElementSibling;
  if (
    !(paragraph instanceof HTMLElement) ||
    !paragraph.classList.contains(CLAMPED_PARAGRAPH_CLASS)
  ) {
    return;
  }

  toggle.addEventListener("click", () => onToggleClick(paragraph, toggle));
  keepToggleVisibilityInSync(paragraph, toggle);
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR).forEach(bindToggle);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
