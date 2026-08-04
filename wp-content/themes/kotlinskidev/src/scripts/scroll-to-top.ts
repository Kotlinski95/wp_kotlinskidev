import { getScrollTop, onScroll, rafThrottle, scrollTo } from "./utils";

(function () {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  const scrollWrapper = document.querySelector(".scroll-to-top-wrapper") as HTMLElement;
  const progressRing = document.querySelector(".progress-ring__progress") as SVGCircleElement;

  if (!scrollToTopBtn || !scrollWrapper || !progressRing) return;

  const handleScroll = () => {
    const scrollTop = getScrollTop();
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollTop > 100) {
      scrollToTopBtn.style.display = "block";
      scrollWrapper.classList.add("show");

      const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
      const circumference = parseFloat(progressRing.dataset.circumference || "0");
      const offset = circumference - scrollProgress * circumference;

      progressRing.style.strokeDashoffset = `${offset}`;
    } else {
      scrollToTopBtn.style.display = "none";
      scrollWrapper.classList.remove("show");
    }
  };

  handleScroll();

  const throttledHandleScroll = rafThrottle(handleScroll);
  onScroll(throttledHandleScroll);

  const handleScrollToTop = (e: Event) => {
    e.preventDefault();
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    mainEl.setAttribute("tabindex", "-1");
    scrollTo(0, "smooth");
    let lastScrollTop = -1;
    const waitForScrollEnd = () => {
      const currentScrollTop = getScrollTop();
      if (currentScrollTop === 0 && lastScrollTop === 0) {
        mainEl.focus();
        return;
      }
      lastScrollTop = currentScrollTop;
      requestAnimationFrame(waitForScrollEnd);
    };
    requestAnimationFrame(waitForScrollEnd);
  };

  scrollToTopBtn.addEventListener("click", handleScrollToTop);

  scrollToTopBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      handleScrollToTop(e);
    }
  });
})();

(function () {
  const progressRing = document.querySelector(".progress-ring");
  const progressCircle = document.querySelector(".progress-ring__progress") as SVGCircleElement;
  if (progressRing && progressCircle) {
    progressRing.setAttribute("role", "img");
    progressRing.setAttribute("aria-label", "Scroll progress");
    progressRing.setAttribute("focusable", "false");
    progressRing.setAttribute("tabindex", "-1");
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const sizeRem = 2.5;
    const sizePx = sizeRem * rem;
    const strokeWidth = 3;
    const radiusPx = sizePx / 2 - strokeWidth / 2;
    progressRing.setAttribute("width", sizePx.toString());
    progressRing.setAttribute("height", sizePx.toString());
    const circles = progressRing.querySelectorAll("circle");
    circles.forEach((circle) => {
      circle.setAttribute("r", radiusPx.toString());
      circle.setAttribute("cx", (sizePx / 2).toString());
      circle.setAttribute("cy", (sizePx / 2).toString());
      circle.setAttribute("stroke-width", strokeWidth.toString());
    });
    const circumference = 2 * Math.PI * radiusPx;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
    progressCircle.dataset.circumference = circumference.toString();
  }
})();
