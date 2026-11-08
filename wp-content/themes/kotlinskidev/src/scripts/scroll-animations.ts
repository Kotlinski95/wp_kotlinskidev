import {
  REVEAL_AFTER_END_SELECTOR,
  SCROLL_ANIMATION_SELECTOR,
  clearWillChangeAfterReveal,
} from "./scroll-animation-selectors";

(function () {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(SCROLL_ANIMATION_SELECTOR)
  ).filter((el) => !el.closest(REVEAL_AFTER_END_SELECTOR));

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
