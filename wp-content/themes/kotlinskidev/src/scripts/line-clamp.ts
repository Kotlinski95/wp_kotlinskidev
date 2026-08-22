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

(function () {
  const EXPANDED_CLASS = "kt-line-clamp--expanded";
  const TOGGLE_HIDDEN_CLASS = "kt-line-clamp-toggle--hidden";

  const getLabel = (key: "read_more" | "read_less", fallback: string): string =>
    window.i18n?.general?.[key] || fallback;

  const isOverflowing = (paragraph: HTMLElement): boolean =>
    paragraph.scrollHeight > paragraph.clientHeight + 1;

  const syncToggleVisibility = (paragraph: HTMLElement, toggle: HTMLElement): void => {
    const expanded = paragraph.classList.contains(EXPANDED_CLASS);
    if (expanded) {
      toggle.classList.remove(TOGGLE_HIDDEN_CLASS);
      return;
    }
    toggle.classList.toggle(TOGGLE_HIDDEN_CLASS, !isOverflowing(paragraph));
  };

  const init = (): void => {
    const toggles = document.querySelectorAll<HTMLElement>(".kt-line-clamp-toggle");

    toggles.forEach((toggle) => {
      const paragraph = toggle.previousElementSibling;
      if (!(paragraph instanceof HTMLElement) || !paragraph.classList.contains("kt-line-clamp")) {
        return;
      }

      toggle.addEventListener("click", () => {
        const expanded = paragraph.classList.toggle(EXPANDED_CLASS);
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        toggle.textContent = expanded
          ? getLabel("read_less", "Read less")
          : getLabel("read_more", "Read more");
      });

      if (typeof ResizeObserver === "function") {
        const observer = new ResizeObserver(() => syncToggleVisibility(paragraph, toggle));
        observer.observe(paragraph);
      } else {
        syncToggleVisibility(paragraph, toggle);
        window.addEventListener("resize", () => syncToggleVisibility(paragraph, toggle));
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
