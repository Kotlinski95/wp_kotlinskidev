const DEFERRED_STYLESHEET_SELECTOR = 'link[rel="stylesheet"][media="print"][onload]';

export const isSameOriginReferrer = (referrer: string, origin: string): boolean => {
  if (!referrer) {
    return false;
  }
  try {
    return new URL(referrer).origin === origin;
  } catch {
    return false;
  }
};

const promoteDeferredStylesheet = (node: Node): void => {
  if (node instanceof HTMLLinkElement && node.matches(DEFERRED_STYLESHEET_SELECTOR)) {
    node.media = "all";
  }
};

export const initBlockingStylesheets = (): void => {
  if (!isSameOriginReferrer(document.referrer, window.location.origin)) {
    return;
  }

  document.querySelectorAll(DEFERRED_STYLESHEET_SELECTOR).forEach(promoteDeferredStylesheet);

  if (typeof MutationObserver === "undefined") {
    return;
  }

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(promoteDeferredStylesheet));
  });
  observer.observe(document.head, { childList: true });
  document.addEventListener("DOMContentLoaded", () => observer.disconnect(), { once: true });
};
