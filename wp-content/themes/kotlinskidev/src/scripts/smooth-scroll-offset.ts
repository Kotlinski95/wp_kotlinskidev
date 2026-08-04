import { getScrollTop, scrollTo, isMobile, getScrollOffsets } from "./utils";

(function () {
  const getHeaderOffset = () => {
    const offsets = getScrollOffsets();
    return isMobile() ? offsets.mobile : offsets.desktop;
  };

  const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const scrollToElementWithOffset = (element: Element) => {
    const elementTop = element.getBoundingClientRect().top + getScrollTop();
    const offsetTop = elementTop - getHeaderOffset();

    const scrollBehavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

    scrollTo(Math.max(0, offsetTop), scrollBehavior);
  };

  const handleAnchorLinks = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = (link as HTMLAnchorElement).getAttribute("href");
        if (!href) return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          scrollToElementWithOffset(targetElement);
          targetElement.focus();

          if (history.pushState) {
            history.pushState(null, "", href);
          }
        }
      });
    });
  };

  const handleInitialHash = () => {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        setTimeout(() => {
          scrollToElementWithOffset(targetElement);
          targetElement.focus();
        }, 100);
      }
    }
  };

  const init = () => {
    handleAnchorLinks();
    handleInitialHash();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("hashchange", handleInitialHash);
})();
