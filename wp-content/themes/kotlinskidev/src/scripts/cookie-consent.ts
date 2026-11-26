declare global {
  interface Window {
    kotlinskiTheme: {
      themeUrl: string;
      assetsUrl: string;
      imagesUrl: string;
    };
    cookieConsentIcon?: HTMLButtonElement;
    consentObserver?: MutationObserver;
  }
}

const CONSENT_BUTTON_SELECTOR = ".cmplz-btn.cmplz-manage-consent";
const COOKIE_ICON_SELECTOR = ".cookie-consent-icon";
const BANNER_LOGO_LINK_SELECTOR = "#cmplz-cookiebanner-1-optin .cmplz-logo a.custom-logo-link";
const FALLBACK_COOKIE_IMAGE_PATH = "/wp-content/themes/active/assets/images/cookie.svg";
const DEFAULT_CONSENT_LABEL = "Manage Cookie Consent";
const COOKIE_ICON_SIZE_PX = 40;
const COOKIE_ICON_ALT = "Cookie consent";
const COOKIE_ICON_STYLES = "display: block; max-width: 100%; height: auto;";
const CONSENT_BUTTON_ICON_STYLES = `
        border-radius: 50% !important;
        padding: 0px !important;
        min-width: auto !important;
        width: auto !important;
        height: auto !important;
        aspect-ratio: 1 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;

const BODY_RETRY_DELAY_MS = 100;
const REPLACE_AFTER_INSERT_DELAY_MS = 100;
const REPLACE_AFTER_LOAD_DELAY_MS = 500;
const FALLBACK_POLL_INTERVAL_MS = 500;
const FALLBACK_POLL_TIMEOUT_MS = 10000;

function resolveCookieImagePath(): string {
  return window.kotlinskiTheme?.imagesUrl
    ? `${window.kotlinskiTheme.imagesUrl}/cookie.svg`
    : FALLBACK_COOKIE_IMAGE_PATH;
}

function createCookieImage(): HTMLImageElement {
  const cookieImage = document.createElement("img");
  cookieImage.src = resolveCookieImagePath();
  cookieImage.alt = COOKIE_ICON_ALT;
  cookieImage.width = COOKIE_ICON_SIZE_PX;
  cookieImage.height = COOKIE_ICON_SIZE_PX;
  cookieImage.style.cssText = COOKIE_ICON_STYLES;
  cookieImage.setAttribute("aria-hidden", "true");
  return cookieImage;
}

function applyIconButtonStyles(consentButton: HTMLButtonElement): void {
  const originalStyle = consentButton.getAttribute("style") || "";
  consentButton.style.cssText = originalStyle + CONSENT_BUTTON_ICON_STYLES;
}

function labelConsentButton(consentButton: HTMLButtonElement, originalText: string): void {
  if (!consentButton.getAttribute("aria-label")) {
    consentButton.setAttribute("aria-label", originalText || DEFAULT_CONSENT_LABEL);
  }

  consentButton.setAttribute("title", originalText || DEFAULT_CONSENT_LABEL);
}

function replaceCookieConsentButton(): void {
  try {
    const consentButton = document.querySelector(CONSENT_BUTTON_SELECTOR) as HTMLButtonElement;

    if (consentButton && !consentButton.dataset.cookieModified) {
      consentButton.dataset.cookieModified = "true";

      const originalText = consentButton.textContent || consentButton.innerText || "";

      consentButton.textContent = "";
      consentButton.append(createCookieImage());

      applyIconButtonStyles(consentButton);
      labelConsentButton(consentButton, originalText);

      window.cookieConsentIcon = consentButton;
    }
  } catch (error) {
    console.warn("Failed to replace cookie consent button:", error);
  }
}

function labelCookieBannerLogo(): void {
  try {
    const logoLink = document.querySelector(BANNER_LOGO_LINK_SELECTOR) as HTMLAnchorElement;

    if (logoLink && !logoLink.getAttribute("aria-label")) {
      logoLink.setAttribute("aria-label", document.title.split("|")[0].trim() || "Home");
    }
  } catch (error) {
    console.warn("Failed to label cookie banner logo:", error);
  }
}

function findConsentButtonIn(element: Element): Element | null {
  return element.matches?.(CONSENT_BUTTON_SELECTOR)
    ? element
    : (element.querySelector?.(CONSENT_BUTTON_SELECTOR) ?? null);
}

function onNodeAdded(node: Node): void {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const consentButton = findConsentButtonIn(node as Element);

  if (consentButton && !document.querySelector(COOKIE_ICON_SELECTOR)) {
    setTimeout(replaceCookieConsentButton, REPLACE_AFTER_INSERT_DELAY_MS);
  }

  labelCookieBannerLogo();
}

function onMutations(mutations: MutationRecord[]): void {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach(onNodeAdded);
    }
  });
}

function pollForConsentButton(): void {
  const fallbackInterval = setInterval(() => {
    if (
      document.querySelector(CONSENT_BUTTON_SELECTOR) &&
      !document.querySelector(COOKIE_ICON_SELECTOR)
    ) {
      replaceCookieConsentButton();
      clearInterval(fallbackInterval);
    }
  }, FALLBACK_POLL_INTERVAL_MS);

  setTimeout(() => clearInterval(fallbackInterval), FALLBACK_POLL_TIMEOUT_MS);
}

function observeConsentButton(): void {
  try {
    const targetNode = document.body || document.documentElement;

    if (!targetNode) {
      setTimeout(observeConsentButton, BODY_RETRY_DELAY_MS);
      return;
    }

    try {
      const observer = new MutationObserver(onMutations);

      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });

      window.consentObserver = observer;
    } catch (error) {
      console.warn("Cookie consent observer setup failed:", error);
      pollForConsentButton();
    }
  } catch (error) {
    console.warn("Failed to initialize cookie consent observer:", error);
  }
}

function replaceAndLabelAfterLoadDelay(): void {
  setTimeout(replaceCookieConsentButton, REPLACE_AFTER_LOAD_DELAY_MS);
  setTimeout(labelCookieBannerLogo, REPLACE_AFTER_LOAD_DELAY_MS);
}

function initCookieConsentReplacement(): void {
  try {
    replaceCookieConsentButton();
    labelCookieBannerLogo();

    observeConsentButton();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        try {
          replaceAndLabelAfterLoadDelay();
        } catch (error) {
          console.warn("Failed to replace cookie consent button on DOM ready:", error);
        }
      });
    } else {
      replaceAndLabelAfterLoadDelay();
    }
  } catch (error) {
    console.warn("Failed to initialize cookie consent replacement:", error);
  }
}

try {
  initCookieConsentReplacement();
} catch (error) {
  console.warn("Failed to auto-initialize cookie consent script:", error);
}

export { replaceCookieConsentButton, initCookieConsentReplacement };
