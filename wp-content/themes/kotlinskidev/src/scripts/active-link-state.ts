interface ActiveLinkStateConfig {
  enabled?: boolean;
  blockClicks?: boolean;
}

declare global {
  interface Window {
    kotlinskidevActiveLinkState?: ActiveLinkStateConfig;
  }
}

(function () {
  const config = window.kotlinskidevActiveLinkState ?? {};

  if (config.enabled === false) {
    return;
  }

  const blockClicks = config.blockClicks !== false;

  const normalizePath = (path: string): string => path.replace(/\/+$/, "") || "/";
  const currentPath = normalizePath(window.location.pathname);

  const isCurrentLinkUrl = (href: string): boolean => {
    const trimmed = href.trim();

    if (trimmed === "" || trimmed === "#") {
      return false;
    }

    if (/^(javascript|mailto|tel):/i.test(trimmed)) {
      return false;
    }

    if (trimmed.includes("#")) {
      return false;
    }

    let url: URL;
    try {
      url = new URL(trimmed, window.location.origin);
    } catch {
      return false;
    }

    if (url.origin !== window.location.origin) {
      return false;
    }

    return normalizePath(url.pathname) === currentPath;
  };

  const disableCurrentLinkClick = (link: HTMLAnchorElement): void => {
    const isPanelTrigger = link.getAttribute("aria-haspopup") === "true";
    const linkNavigatesOnClick = link.closest("[data-link-navigates]") !== null;

    if (isPanelTrigger && !linkNavigatesOnClick) {
      return;
    }

    if (!isPanelTrigger) {
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
    }

    const style = (link.getAttribute("style") ?? "").trim();
    const withSemicolon = style && !style.endsWith(";") ? `${style};` : style;
    link.setAttribute("style", `${withSemicolon}pointer-events:none`);
  };

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    if (
      link.classList.contains("kt-link-current") ||
      link.classList.contains("kt-hover-no-link-gradient")
    ) {
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
})();
