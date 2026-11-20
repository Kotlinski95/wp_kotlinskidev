const BUTTON_SELECTOR = ".language-selector-button";
const MODAL_SELECTOR = ".language-modal";

const findModal = (): HTMLElement | null => document.querySelector<HTMLElement>(MODAL_SELECTOR);

const onLanguageButtonClick = (event: Event): void => {
  const modal = findModal();
  if (!modal) {
    return;
  }
  modal.style.display = modal.style.display === "block" ? "none" : "block";
  event.stopPropagation();
};

const onDocumentClick = (event: Event): void => {
  const modal = findModal();
  const button = document.querySelector<HTMLElement>(BUTTON_SELECTOR);
  if (!modal || !button) {
    return;
  }
  const target = event.target as Node;
  if (!button.contains(target) && !modal.contains(target)) {
    modal.style.display = "none";
  }
};

document.querySelector(BUTTON_SELECTOR)?.addEventListener("click", onLanguageButtonClick);
document.addEventListener("click", onDocumentClick);

export {};
