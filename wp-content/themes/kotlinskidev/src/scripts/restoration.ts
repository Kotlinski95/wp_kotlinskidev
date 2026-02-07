(function () {
  window.addEventListener("pagehide", () => {
    localStorage.setItem("scrollPosition", `${window.scrollY}`);
  });

  window.addEventListener("pageshow", (event) => {
    const navigationEntries = performance.getEntriesByType("navigation");
    const navigationType =
      navigationEntries.length > 0 && navigationEntries[0] instanceof PerformanceNavigationTiming
        ? navigationEntries[0].type
        : event.persisted
          ? "back_forward"
          : "navigate";

    if (navigationType === "back_forward") {
      const scrollPosition = localStorage.getItem("scrollPosition");
      if (scrollPosition) {
        window.scrollTo(0, +scrollPosition);
      }
    }
  });
})();
