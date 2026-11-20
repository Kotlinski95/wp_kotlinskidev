import { getConfig, getThemeUrl } from "./config";
import type { Purifier } from "./purifier";

export const revealContent = (
  element: HTMLElement,
  content: string,
  type: string,
  DOMPurify: Purifier
): void => {
  element.innerHTML = DOMPurify.sanitize(content);
  element.classList.remove("protection-loading");
  element.classList.add("protection-loaded");
  element.removeAttribute("data-original-content");
  element.setAttribute("aria-label", `Protected ${type} content revealed`);
};

export const showError = (element: HTMLElement, type: string, DOMPurify: Purifier): void => {
  const config = getConfig();
  element.innerHTML = DOMPurify.sanitize(config.errorText);
  element.classList.remove("protection-loading");
  element.classList.add("protection-error");
  element.setAttribute("aria-label", `Failed to load protected ${type} content`);
};

export const showLoading = (element: HTMLElement): void => {
  element.replaceChildren();
  const spinner = document.createElement("img");
  spinner.src = `${getThemeUrl()}/assets/images/loading.svg`;
  spinner.alt = "Loading...";
  spinner.className = "protection-loading-spinner";
  element.append(spinner);
  element.classList.add("protection-loading");
};
