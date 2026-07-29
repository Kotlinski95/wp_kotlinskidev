/**
 * Replace Complianz consent button with cookie icon
 */

declare global {
  interface Window {
    kotlinskiTheme: {
      themeUrl: string;
      assetsUrl: string;
      imagesUrl: string;
    };
  }
}

function replaceCookieConsentButton(): void {
  try {
    const consentButton = document.querySelector(
      ".cmplz-btn.cmplz-manage-consent"
    ) as HTMLButtonElement;

    if (consentButton && !consentButton.dataset.cookieModified) {
      consentButton.dataset.cookieModified = "true";

      const originalText = consentButton.textContent || consentButton.innerText || "";

      const cookieImagePath = window.kotlinskiTheme?.imagesUrl
        ? `${window.kotlinskiTheme.imagesUrl}/cookie.svg`
        : "/wp-content/themes/active/assets/images/cookie.svg";

      consentButton.innerHTML = `
        <img src="${cookieImagePath}" 
             alt="Cookie consent" 
             width="40" 
             height="40" 
             style="display: block; max-width: 100%; height: auto;"
             aria-hidden="true" />
      `;

      const originalStyle = consentButton.getAttribute("style") || "";
      consentButton.style.cssText =
        originalStyle +
        `
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

      if (!consentButton.getAttribute("aria-label")) {
        consentButton.setAttribute("aria-label", originalText || "Manage Cookie Consent");
      }

      consentButton.setAttribute("title", originalText || "Manage Cookie Consent");

      (window as any).cookieConsentIcon = consentButton;
    }
  } catch (error) {
    console.warn("Failed to replace cookie consent button:", error);
  }
}

function labelCookieBannerLogo(): void {
  try {
    const logoLink = document.querySelector(
      "#cmplz-cookiebanner-1-optin .cmplz-logo a.custom-logo-link"
    ) as HTMLAnchorElement;

    if (logoLink && !logoLink.getAttribute("aria-label")) {
      logoLink.setAttribute("aria-label", document.title.split("|")[0].trim() || "Home");
    }
  } catch (error) {
    console.warn("Failed to label cookie banner logo:", error);
  }
}

function observeConsentButton(): void {
  try {
    const targetNode = document.body || document.documentElement;

    if (!targetNode) {
      setTimeout(observeConsentButton, 100);
      return;
    }

    try {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const consentButton = element.matches?.(".cmplz-btn.cmplz-manage-consent")
                  ? element
                  : element.querySelector?.(".cmplz-btn.cmplz-manage-consent");

                if (consentButton && !document.querySelector(".cookie-consent-icon")) {
                  setTimeout(replaceCookieConsentButton, 100);
                }

                labelCookieBannerLogo();
              }
            });
          }
        });
      });

      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });

      (window as any).consentObserver = observer;
    } catch (error) {
      console.warn("Cookie consent observer setup failed:", error);
      const fallbackInterval = setInterval(() => {
        if (
          document.querySelector(".cmplz-btn.cmplz-manage-consent") &&
          !document.querySelector(".cookie-consent-icon")
        ) {
          replaceCookieConsentButton();
          clearInterval(fallbackInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(fallbackInterval), 10000);
    }
  } catch (error) {
    console.warn("Failed to initialize cookie consent observer:", error);
  }
}

function initCookieConsentReplacement(): void {
  try {
    replaceCookieConsentButton();
    labelCookieBannerLogo();

    observeConsentButton();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        try {
          setTimeout(replaceCookieConsentButton, 500);
          setTimeout(labelCookieBannerLogo, 500);
        } catch (error) {
          console.warn("Failed to replace cookie consent button on DOM ready:", error);
        }
      });
    } else {
      setTimeout(replaceCookieConsentButton, 500);
      setTimeout(labelCookieBannerLogo, 500);
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
