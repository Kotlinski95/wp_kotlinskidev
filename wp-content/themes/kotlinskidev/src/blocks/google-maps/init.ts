const ROOT_SELECTOR = "[data-kt-google-maps]";
const PLACEHOLDER_SELECTOR = "[data-kt-google-maps-placeholder]";
const CONSENT_BUTTON_SELECTOR = "[data-kt-google-maps-consent]";
const RESET_BUTTON_SELECTOR = 'button[id^="reset-view-btn-"]';
const MARKETING_CATEGORY = "marketing";

interface ConsentEventDetail {
  category?: string;
  categories?: string[];
}

const revealMaps = (): void => {
  document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach((root) => {
    root.querySelector(PLACEHOLDER_SELECTOR)?.remove();
    const resetButton = root.querySelector<HTMLButtonElement>(RESET_BUTTON_SELECTOR);
    if (resetButton) {
      resetButton.hidden = false;
    }
  });
};

const hasMarketingConsent = (event: Event): boolean => {
  const detail = (event as CustomEvent<ConsentEventDetail>).detail;
  return (
    detail?.category === MARKETING_CATEGORY ||
    (detail?.categories ?? []).includes(MARKETING_CATEGORY)
  );
};

const onConsentEvent = (event: Event): void => {
  if (hasMarketingConsent(event)) {
    revealMaps();
  }
};

const openConsentDialog = (): void => {
  document.querySelector<HTMLElement>(".cmplz-manage-consent")?.click();
};

const onDocumentClick = (event: Event): void => {
  const target = event.target as Element | null;
  if (target?.closest(CONSENT_BUTTON_SELECTOR)) {
    openConsentDialog();
  }
};

document.addEventListener("cmplz_fire_categories", onConsentEvent);
document.addEventListener("cmplz_enable_category", onConsentEvent);
document.addEventListener("click", onDocumentClick);
