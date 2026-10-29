import { trackEvent, type AnalyticsEventParams } from "./track-event";

export { trackEvent, type AnalyticsEventParams };

declare global {
  interface Window {
    kotlinskiAnalytics?: {
      trackEvent: (name: string, params?: AnalyticsEventParams) => void;
    };
  }
}

const PROJECT_CARD_SELECTOR = ".kt-project-card";
const CTA_LINK_SELECTOR = ".wp-block-button__link, .kt-button__link, .wp-element-button";
const LANGUAGE_LINK_SELECTOR =
  ".kt-lang-panel__list a[hreflang], .wp-block-polylang-language-switcher a[hreflang]";
const PROJECT_TITLE_SELECTOR = "h1, h2, h3, h4";
const COOKIE_CONSENT_SELECTOR = ".cmplz-btn.cmplz-manage-consent";
const ACCESSIBILITY_TOGGLE_SELECTOR = ".onetap-toggle";

function toSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, (letter, _match, offset: number) =>
    offset === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
  );
}

function paramsFromDataset(dataset: DOMStringMap): AnalyticsEventParams {
  const params: AnalyticsEventParams = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (key === "gaEvent" || value === undefined) {
      continue;
    }
    params[toSnakeCase(key.replace(/^ga/, ""))] = value;
  }
  return params;
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const explicit = target.closest<HTMLElement>("[data-ga-event]");
  if (explicit?.dataset.gaEvent) {
    trackEvent(explicit.dataset.gaEvent, paramsFromDataset(explicit.dataset));
    return;
  }

  const languageLink = target.closest<HTMLAnchorElement>(LANGUAGE_LINK_SELECTOR);
  if (languageLink) {
    trackEvent("language_switch", {
      language: languageLink.hreflang,
      link_url: languageLink.href,
    });
    return;
  }

  const projectCard = target.closest<HTMLElement>(PROJECT_CARD_SELECTOR);
  if (projectCard) {
    trackEvent("select_content", {
      content_type: "project",
      item_name: projectCard.querySelector(PROJECT_TITLE_SELECTOR)?.textContent?.trim() ?? "",
    });
    return;
  }

  if (target.closest(COOKIE_CONSENT_SELECTOR)) {
    trackEvent("cookie_consent_click");
    return;
  }

  if (target.closest(ACCESSIBILITY_TOGGLE_SELECTOR)) {
    trackEvent("accessibility_toggle_click");
    return;
  }

  const ctaLink = target.closest<HTMLAnchorElement>(CTA_LINK_SELECTOR);
  if (ctaLink) {
    trackEvent("cta_click", {
      link_text: ctaLink.textContent?.trim() ?? "",
      link_url: ctaLink.href,
    });
  }
}

function trackPageNotFound(): void {
  if (document.body.classList.contains("error404")) {
    trackEvent("page_not_found", { page_location: window.location.href });
  }
}

document.addEventListener("click", handleClick, { passive: true });
window.kotlinskiAnalytics = { trackEvent };
trackPageNotFound();
