(function () {
  const HEADER_OFFSET = 75;

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const scrollToElementWithOffset = (element: Element) => {
    const elementTop = element.getBoundingClientRect().top + document.body.scrollTop;
    const offsetTop = elementTop - HEADER_OFFSET;
    
    const scrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    
    document.body.scrollTo({
      top: Math.max(0, offsetTop),
      behavior: scrollBehavior
    });
  };

  const handleAnchorLinks = () => {
    const anchorLinks = document.querySelectorAll(
      'a[href^="#"]:not([href="#"])'
    );

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = (link as HTMLAnchorElement).getAttribute("href");
        if (!href) return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          scrollToElementWithOffset(targetElement);
          targetElement.focus(); // Ensure focus for accessibility

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
          targetElement.focus(); // Ensure focus for accessibility
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