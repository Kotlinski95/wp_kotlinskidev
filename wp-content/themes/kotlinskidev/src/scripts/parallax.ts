import { getScrollTop, onScroll } from "./utils";

interface ParallaxElement extends HTMLElement {
  dataset: DOMStringMap & {
    parallaxSpeed?: string;
    parallaxEnabled?: string;
  };
}

const visibleElements = new Set<ParallaxElement>();
let observer: IntersectionObserver | null = null;
let ticking = false;
let elements: ParallaxElement[] = [];
let needsUpdate = false;

function setupParallaxElements() {
  elements.forEach((element) => {
    element.dataset.parallaxSpeed = element.dataset.parallaxSpeed || "0.5";
    const existingBg = element.querySelector(
      ".wp-block-cover__image-background"
    ) as HTMLImageElement;
    if (existingBg) {
      const bgWrapper = document.createElement("div");
      bgWrapper.className = "parallax-bg-wrapper";
      const parallaxBg = existingBg.cloneNode(true) as HTMLImageElement;
      parallaxBg.className = "parallax-bg";
      bgWrapper.appendChild(parallaxBg);
      existingBg.parentNode?.insertBefore(bgWrapper, existingBg);
      existingBg.style.display = "none";
      bgWrapper.style.cssText = `
        position: absolute;
        top: -20%;
        left: 0;
        right: 0;
        bottom: -20%;
        overflow: hidden;
        z-index: 1;
        display: block;
      `;
      parallaxBg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 150%;
        object-fit: cover;
        will-change: transform;
      `;
    }
    const innerContainer = element.querySelector(".wp-block-cover__inner-container") as HTMLElement;
    if (innerContainer) {
      innerContainer.style.position = "relative";
      innerContainer.style.zIndex = "3";
    }
    const overlay = element.querySelector(".wp-block-cover__background") as HTMLElement;
    if (overlay) {
      overlay.style.zIndex = "2";
    }
    const contentElements = element.querySelectorAll(
      ".wp-block-heading, .wp-block-buttons, .wp-block-paragraph"
    ) as NodeListOf<HTMLElement>;
    contentElements.forEach((content) => {
      content.classList.add("parallax-content");
    });
  });
}

function setupIntersectionObserver() {
  if (observer) observer.disconnect();
  visibleElements.clear();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as ParallaxElement;
        if (entry.isIntersecting) {
          visibleElements.add(el);
        } else {
          visibleElements.delete(el);
        }
      });
    },
    {
      root: null,
      threshold: 0,
    }
  );
  elements.forEach((el) => observer!.observe(el));
}

function updateParallax() {
  const scrollTop = getScrollTop();
  visibleElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollTop;
    const speed = parseFloat(element.dataset.parallaxSpeed || "0.5");
    const yPos = (scrollTop - elementTop) * speed;
    const bg = element.querySelector(".parallax-bg") as HTMLElement;
    if (bg) {
      bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
    }
  });
}

function animationLoop() {
  if (needsUpdate) {
    updateParallax();
    needsUpdate = false;
  }
  requestAnimationFrame(animationLoop);
}

function bindEvents() {
  onScroll(() => { needsUpdate = true; });
  window.addEventListener("resize", () => { needsUpdate = true; }, { passive: true });
}

function initParallax() {
  elements = Array.from(
    document.querySelectorAll<ParallaxElement>(".wp-block-cover.enable-parallax")
  );
  if (elements.length === 0) {
    console.warn("⚠️ Parallax Debug: No parallax elements found! Exiting...");
    return;
  }
  setupParallaxElements();
  setupIntersectionObserver();
  bindEvents();
  updateParallax();
  requestAnimationFrame(animationLoop);
}

document.addEventListener("DOMContentLoaded", initParallax);
document.addEventListener("wp-blocks-loaded", initParallax);
