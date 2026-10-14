(function () {
  const selectors = [
    ".appear-on-scroll",
    ".fade-in-on-scroll",
    ".fade-up-on-scroll",
    ".fade-left-on-scroll",
    ".fade-right-on-scroll",
    ".flip-up-on-scroll",
    ".flip-down-on-scroll",
    ".flip-left-on-scroll",
    ".flip-right-on-scroll",
  ];
  const elements = document.querySelectorAll<HTMLElement>(selectors.join(","));
  const clearWillChangeAfterReveal = (el: HTMLElement) => {
    el.addEventListener(
      "transitionend",
      () => {
        el.style.willChange = "auto";
      },
      { once: true }
    );
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            clearWillChangeAfterReveal(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el: HTMLElement) => observer.observe(el));
  } else {
    const revealed = new WeakSet<HTMLElement>();
    const onScroll = () => {
      const windowHeight = window.innerHeight;
      elements.forEach((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight - 50 && !revealed.has(el)) {
          revealed.add(el);
          el.classList.add("visible");
          clearWillChangeAfterReveal(el);
        }
      });
    };
    document.addEventListener("DOMContentLoaded", onScroll);
    (window as Window).addEventListener("scroll", onScroll);
    (window as Window).addEventListener("resize", onScroll);
  }
})();
