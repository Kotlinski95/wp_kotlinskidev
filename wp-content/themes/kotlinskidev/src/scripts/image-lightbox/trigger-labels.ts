const TRIGGER_SELECTOR = ".wp-block-image button.lightbox-trigger";
const FALLBACK_LABEL = "Expand image";

const applyTriggerLabel = (button: HTMLButtonElement): void => {
  if (button.getAttribute("aria-label")) {
    return;
  }
  const img = button.closest("figure")?.querySelector("img");
  button.setAttribute("aria-label", img?.alt || FALLBACK_LABEL);
};

export const labelLightboxTriggers = (): void => {
  document.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR).forEach((button) => {
    applyTriggerLabel(button);
    new MutationObserver(() => applyTriggerLabel(button)).observe(button, {
      attributes: true,
      attributeFilter: ["aria-label"],
    });
  });
};
