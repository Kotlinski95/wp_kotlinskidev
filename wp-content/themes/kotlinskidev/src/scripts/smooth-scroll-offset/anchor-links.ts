import { scrollToElementWithOffset } from "./scroll-to-element";

const ANCHOR_LINK_SELECTOR =
  'a[href^="#"]:not([href="#"]):not([href^="#kt-modal-"]):not([data-kt-toc-link])';

const onAnchorLinkClick = (event: Event): void => {
  const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href");
  if (!href) {
    return;
  }
  const targetElement = document.getElementById(href.substring(1));
  if (!targetElement) {
    return;
  }
  event.preventDefault();
  scrollToElementWithOffset(targetElement);
  targetElement.focus();
  if (history.pushState) {
    history.pushState(null, "", href);
  }
};

export const bindAnchorLinks = (): void => {
  document.querySelectorAll(ANCHOR_LINK_SELECTOR).forEach((link) => {
    link.addEventListener("click", onAnchorLinkClick);
  });
};
