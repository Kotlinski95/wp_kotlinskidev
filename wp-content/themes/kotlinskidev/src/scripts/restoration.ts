(function () {
  window.addEventListener("pagehide", () => {
    localStorage.setItem("scrollPosition", `${window.scrollY}`);
  });

  window.addEventListener("pageshow", (event) => {
    const navigationEntries = performance.getEntriesByType("navigation");
    let navigationType: string;
    if (
      navigationEntries.length > 0 &&
      navigationEntries[0] instanceof PerformanceNavigationTiming
    ) {
      navigationType = navigationEntries[0].type;
    } else if (event.persisted) {
      navigationType = "back_forward";
    } else {
      navigationType = "navigate";
    }

    if (navigationType === "back_forward") {
      const scrollPosition = localStorage.getItem("scrollPosition");
      if (scrollPosition) {
        window.scrollTo(0, +scrollPosition);
      }
    }
  });
})();
