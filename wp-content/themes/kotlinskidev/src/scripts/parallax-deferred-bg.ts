const NEAR_VIEWPORT_MARGIN = "400px";
const DEFERRED_BG_ATTRIBUTE = "data-kt-parallax-bg";
const DEFERRED_BG_SELECTOR = `[${DEFERRED_BG_ATTRIBUTE}]`;

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
  const value = element.getAttribute(DEFERRED_BG_ATTRIBUTE);
  const cssUrl = value ? toSafeCssUrl(value) : null;
  if (cssUrl) {
    element.style.backgroundImage = cssUrl;
  }
  element.removeAttribute(DEFERRED_BG_ATTRIBUTE);
};

const initParallaxDeferredBg = (): void => {
  const elements = document.querySelectorAll<HTMLElement>(DEFERRED_BG_SELECTOR);
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
