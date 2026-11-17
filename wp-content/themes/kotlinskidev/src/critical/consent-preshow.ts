export const CMPLZ_PENDING_CLASS = "kt-cmplz-pending";
export const CMPLZ_STATUS_COOKIE = "cmplz_banner-status";
export const CMPLZ_RELEASED_EVENT = "kt-cmplz-released";
const CMPLZ_FALLBACK_MS = 8000;
const CMPLZ_RELEASE_EVENTS = ["cmplz_status_change", "cmplz_cookie_warning_loaded"] as const;

type NavigatorWithPrivacy = Navigator & { globalPrivacyControl?: boolean };

export const hasConsentCookie = (): boolean =>
  document.cookie.split(";").some((part) => part.trim().startsWith(`${CMPLZ_STATUS_COOKIE}=`));

const hasPrivacySignal = (): boolean =>
  navigator.doNotTrack === "1" || (navigator as NavigatorWithPrivacy).globalPrivacyControl === true;

const isSkipPage = (): boolean => document.querySelector('meta[name="kt-cmplz-skip"]') !== null;

export const shouldPreshowBanner = (): boolean =>
  !hasConsentCookie() && !hasPrivacySignal() && !isSkipPage();

const bannerIsShown = (): boolean =>
  document.querySelector(".cmplz-cookiebanner:not(.cmplz-hidden)") !== null;

export const initConsentPreshow = (): (() => void) => {
  const root = document.documentElement;
  if (!shouldPreshowBanner()) {
    return () => undefined;
  }
  root.classList.add(CMPLZ_PENDING_CLASS);

  let observer: MutationObserver | null = null;
  let fallbackTimer: number | undefined;

  let released = false;

  const release = (): void => {
    if (released) {
      return;
    }
    released = true;
    root.classList.remove(CMPLZ_PENDING_CLASS);
    document.dispatchEvent(new Event(CMPLZ_RELEASED_EVENT));
    observer?.disconnect();
    window.clearTimeout(fallbackTimer);
    CMPLZ_RELEASE_EVENTS.forEach((name) => document.removeEventListener(name, onEvent));
  };

  const releaseWhenSettled = (): void => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (hasConsentCookie() || bannerIsShown()) {
          release();
        }
      });
    });
  };

  const onEvent = releaseWhenSettled;

  CMPLZ_RELEASE_EVENTS.forEach((name) => document.addEventListener(name, onEvent));

  const watch = (): void => {
    observer = new MutationObserver(() => {
      if (bannerIsShown() || hasConsentCookie()) {
        releaseWhenSettled();
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  };

  const armFallback = (): void => {
    fallbackTimer = window.setTimeout(release, CMPLZ_FALLBACK_MS);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch, { once: true });
  } else {
    watch();
  }

  if (document.readyState === "complete") {
    armFallback();
  } else {
    window.addEventListener("load", armFallback, { once: true });
  }

  return release;
};
