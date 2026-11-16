const NEAR_VIEWPORT_MARGIN = "400px";
const SELECTOR = "[data-kt-parallax-bg]";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const toSafeCssUrl = (value: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(value, window.location.href);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return null;
  }
  const escaped = parsed.href.replace(/["\\)]/g, "\\$&");
  return `url("${escaped}")`;
};

const applyBackground = (element: HTMLElement): void => {
  const value = element.getAttribute("data-kt-parallax-bg");
  const cssUrl = value ? toSafeCssUrl(value) : null;
  if (cssUrl) {
    element.style.backgroundImage = cssUrl;
  }
  element.removeAttribute("data-kt-parallax-bg");
};

const initParallaxDeferredBg = (): void => {
  const elements = document.querySelectorAll<HTMLElement>(SELECTOR);
  if (!elements.length) {
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    elements.forEach(applyBackground);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        applyBackground(entry.target as HTMLElement);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: NEAR_VIEWPORT_MARGIN }
  );

  elements.forEach((element) => observer.observe(element));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initParallaxDeferredBg);
} else {
  initParallaxDeferredBg();
}
