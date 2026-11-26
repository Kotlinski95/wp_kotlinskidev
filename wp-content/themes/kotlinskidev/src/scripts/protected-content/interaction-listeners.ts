import { trackEvent } from "../track-event";
import { copyToClipboard } from "./clipboard";

const COPY_FEEDBACK_MS = 1500;
const COPIED_CLASSES = ["kt-copy-btn--copied", "kt-tooltip--visible"];

const copyButtonRevertTimeouts = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

const trackProtectedInteraction = (element: HTMLElement, action: "copy" | "click"): void => {
  const type = element
    .closest<HTMLElement>("[data-protection-type]")
    ?.getAttribute("data-protection-type");
  if (!type) {
    return;
  }
  trackEvent("protected_content_reveal", { type, action });
};

const onProtectedLinkClick = (event: Event): void => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
    'a[href^="tel:"], a[href^="mailto:"]'
  );
  if (!link) {
    return;
  }
  trackProtectedInteraction(link, "click");
};

const setCopyFeedback = (button: HTMLButtonElement, label: string): void => {
  button.setAttribute("aria-label", label);
  button.setAttribute("data-tooltip", label);
};

const showCopiedFeedback = (button: HTMLButtonElement): void => {
  const copyLabel = button.getAttribute("data-copy-label") || "";
  const copiedLabel = button.getAttribute("data-copied-label") || copyLabel;

  const pendingTimeout = copyButtonRevertTimeouts.get(button);
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
  }

  button.classList.add(...COPIED_CLASSES);
  setCopyFeedback(button, copiedLabel);

  copyButtonRevertTimeouts.set(
    button,
    setTimeout(() => {
      button.classList.remove(...COPIED_CLASSES);
      setCopyFeedback(button, copyLabel);
      copyButtonRevertTimeouts.delete(button);
    }, COPY_FEEDBACK_MS)
  );
};

const onCopyButtonClick = async (event: Event): Promise<void> => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".kt-copy-btn");
  if (!button) {
    return;
  }

  const value = button.getAttribute("data-copy-value");
  if (!value) {
    return;
  }

  const succeeded = await copyToClipboard(value);
  if (!succeeded) {
    console.error("Failed to copy to clipboard");
    return;
  }

  trackProtectedInteraction(button, "copy");
  showCopiedFeedback(button);
};

export const observeCopyButtons = (): void => {
  document.addEventListener("click", onCopyButtonClick);
  document.addEventListener("click", onProtectedLinkClick);
};
