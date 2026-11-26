const NAV_HIDDEN_CLASS = "nav-hidden";
const FLOATING_ELEMENT_HIDDEN_CLASS = "mobile-nav-hidden";
const FLOATING_ICON_SELECTORS = [
  ".cmplz-btn.cmplz-manage-consent",
  "#ka11y-root",
  ".kt-article-toc-toggle",
  ".kt-speed-dial",
];

export interface HideableNavElements {
  header: HTMLElement | null;
  mobileFooterNav: HTMLElement | null;
  scrollToTop: HTMLElement | null;
}

export interface NavVisibility {
  showNav: () => void;
  hideNav: () => void;
}

const setFloatingIconsHidden = (hidden: boolean): void => {
  FLOATING_ICON_SELECTORS.forEach((selector) => {
    document.querySelector(selector)?.classList.toggle(FLOATING_ELEMENT_HIDDEN_CLASS, hidden);
  });
};

export const findHideableNavElements = (): HideableNavElements => ({
  header: document.querySelector<HTMLElement>("header"),
  mobileFooterNav: document.querySelector<HTMLElement>(".mobile-footer-nav"),
  scrollToTop: document.querySelector<HTMLElement>(".kotlinskidev-scrollto-top"),
});

export const createNavVisibility = ({
  header,
  mobileFooterNav,
  scrollToTop,
}: HideableNavElements): NavVisibility => ({
  showNav: () => {
    header?.classList.remove(NAV_HIDDEN_CLASS);
    mobileFooterNav?.classList.remove(NAV_HIDDEN_CLASS);
    scrollToTop?.classList.remove(FLOATING_ELEMENT_HIDDEN_CLASS);
    setFloatingIconsHidden(false);
  },
  hideNav: () => {
    header?.classList.add(NAV_HIDDEN_CLASS);
    mobileFooterNav?.classList.add(NAV_HIDDEN_CLASS);
    scrollToTop?.classList.add(FLOATING_ELEMENT_HIDDEN_CLASS);
    setFloatingIconsHidden(true);
  },
});
