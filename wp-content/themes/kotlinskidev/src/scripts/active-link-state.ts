import { createCurrentLinkMatcher, normalizePath } from "./active-link-state/current-link-matcher";
import { disableCurrentLinkClick } from "./active-link-state/disable-current-link-click";

interface ActiveLinkStateConfig {
  enabled?: boolean;
  blockClicks?: boolean;
}

declare global {
  interface Window {
    kotlinskidevActiveLinkState?: ActiveLinkStateConfig;
  }
}

const EXCLUDED_LINK_CLASS = "kt-hover-no-link-gradient";

const markCurrentLinks = (blockClicks: boolean): void => {
  const isCurrentLinkUrl = createCurrentLinkMatcher(
    normalizePath(window.location.pathname),
    window.location.search
  );

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    if (link.classList.contains(EXCLUDED_LINK_CLASS)) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || !isCurrentLinkUrl(href)) {
      return;
    }

    link.classList.add("kt-link-current");
    link.setAttribute("aria-current", "page");

    if (blockClicks) {
      disableCurrentLinkClick(link);
    }
  });
};

const config = window.kotlinskidevActiveLinkState ?? {};

if (config.enabled !== false) {
  markCurrentLinks(config.blockClicks !== false);
}
