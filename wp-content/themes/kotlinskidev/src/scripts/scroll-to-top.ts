import { debounce } from "./utils";

(function () {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  const scrollWrapper = document.querySelector('.scroll-to-top-wrapper') as HTMLElement;
  const progressRing = document.querySelector('.progress-ring__progress') as SVGCircleElement;
  
  if (!scrollToTopBtn || !scrollWrapper || !progressRing) return;

  const handleScroll = () => {
    // Use body for scroll progress when body is scrollable
    const scrollTop = document.body.scrollTop;
    const scrollHeight = document.body.scrollHeight - document.body.clientHeight;

    if (scrollTop > 100) {
      scrollToTopBtn.style.display = "block";
      scrollWrapper.classList.add('show');

      const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
      const circumference = parseFloat(progressRing.dataset.circumference || "0");
      const offset = circumference - (scrollProgress * circumference);

      progressRing.style.strokeDashoffset = `${offset}`;
    } else {
      scrollToTopBtn.style.display = "none";
      scrollWrapper.classList.remove('show');
    }
  };

  handleScroll();

  const debouncedHandleScroll = debounce(handleScroll, 16); // ~60fps for smooth animation
  document.body.addEventListener("scroll", debouncedHandleScroll);
  window.addEventListener("scroll", debouncedHandleScroll);

  scrollToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    mainEl.setAttribute("tabindex", "-1"); // Ensure focusable
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    let lastScrollTop = -1;
    const waitForScrollEnd = () => {
      const currentScrollTop = document.body.scrollTop;
      if (currentScrollTop === 0 && lastScrollTop === 0) {
        mainEl.focus();
        return;
      }
      lastScrollTop = currentScrollTop;
      requestAnimationFrame(waitForScrollEnd);
    };
    requestAnimationFrame(waitForScrollEnd);
  });

  // Keyboard accessibility: activate on Enter or Space
  scrollToTopBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const mainEl = document.querySelector("main");
      if (!mainEl) return;
      mainEl.setAttribute("tabindex", "-1");
      document.body.scrollTo({ top: 0, behavior: "smooth" });
      let lastScrollTop = -1;
      const waitForScrollEnd = () => {
        const currentScrollTop = document.body.scrollTop;
        if (currentScrollTop === 0 && lastScrollTop === 0) {
          mainEl.focus();
          return;
        }
        lastScrollTop = currentScrollTop;
        requestAnimationFrame(waitForScrollEnd);
      };
      requestAnimationFrame(waitForScrollEnd);
    }
  });
})();

(function () {
  // Accessibility improvements for SVG
  const progressRing = document.querySelector('.progress-ring');
  const progressCircle = document.querySelector('.progress-ring__progress') as SVGCircleElement;
  if (progressRing && progressCircle) {
    progressRing.setAttribute('role', 'img');
    progressRing.setAttribute('aria-label', 'Scroll progress');
    progressRing.setAttribute('focusable', 'false');
    progressRing.setAttribute('tabindex', '-1');
    // Dynamically set SVG size and radius based on rem
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const sizeRem = 2.5; // 2.5rem (was 40px if root font-size is 16px)
    const sizePx = sizeRem * rem;
    const strokeWidth = 3; // match your SVG stroke-width
    const radiusPx = (sizePx / 2) - (strokeWidth / 2); // radius in px, but sizePx is now based on rem
    progressRing.setAttribute('width', sizePx.toString());
    progressRing.setAttribute('height', sizePx.toString());
    const circles = progressRing.querySelectorAll('circle');
    circles.forEach(circle => {
      circle.setAttribute('r', radiusPx.toString());
      circle.setAttribute('cx', (sizePx / 2).toString());
      circle.setAttribute('cy', (sizePx / 2).toString());
      circle.setAttribute('stroke-width', strokeWidth.toString());
    });
    // Update JS progress bar logic to use dynamic radius
    const circumference = 2 * Math.PI * radiusPx;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
    progressCircle.dataset.circumference = circumference.toString();
  }
})();
