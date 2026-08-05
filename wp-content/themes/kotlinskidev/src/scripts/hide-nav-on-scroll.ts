import { debounce, getScrollTop, isMobile, onScroll, onScreenSizeChange } from "./utils";

(function () {
  const header = document.querySelector("header") as HTMLElement;
  const mobileFooterNav = document.querySelector(".mobile-footer-nav") as HTMLElement;
  const scrollToTop = document.querySelector(".kotlinskidev-scrollto-top") as HTMLElement;

  if (!header && !mobileFooterNav) {
    return;
  }

  let lastScrollTop = 0;
  const scrollThreshold = 10;
  const topThreshold = 100;
  const bottomThreshold = 100;

  const toggleCookieButtonClass = (add: boolean) => {
    const cookieButton = document.querySelector(".cmplz-btn.cmplz-manage-consent");
    if (cookieButton) {
      if (add) {
        cookieButton.classList.add("mobile-nav-hidden");
      } else {
        cookieButton.classList.remove("mobile-nav-hidden");
      }
    }
  };

  const showNav = () => {
    if (header) {
      header.classList.remove("nav-hidden");
    }
    if (mobileFooterNav) {
      mobileFooterNav.classList.remove("nav-hidden");
    }
    if (scrollToTop) {
      scrollToTop.classList.remove("mobile-nav-hidden");
    }
    toggleCookieButtonClass(false);
  };

  const hideNav = () => {
    if (header) {
      header.classList.add("nav-hidden");
    }
    if (mobileFooterNav) {
      mobileFooterNav.classList.add("nav-hidden");
    }
    if (scrollToTop) {
      scrollToTop.classList.add("mobile-nav-hidden");
    }
    toggleCookieButtonClass(true);
  };

  const isNearBottom = (scrollTop: number) => {
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    return documentHeight - (scrollTop + viewportHeight) < bottomThreshold;
  };

  const handleScroll = () => {
    const scrollTop = getScrollTop();
    const scrollDirection = scrollTop > lastScrollTop ? "down" : "up";
    const scrollDiff = Math.abs(scrollTop - lastScrollTop);

    if (scrollDiff < scrollThreshold) {
      return;
    }

    if (scrollTop < topThreshold || isNearBottom(scrollTop)) {
      showNav();
      lastScrollTop = scrollTop;
      return;
    }

    if (scrollDirection === "down") {
      hideNav();
    } else {
      showNav();
    }

    lastScrollTop = scrollTop;
  };

  const debouncedHandleScroll = debounce(handleScroll, 10);
  let isListening = false;
  let removeScrollListener: (() => void) | null = null;

  const enableScrollHide = () => {
    if (isListening) {
      return;
    }

    handleScroll();

    removeScrollListener = onScroll(debouncedHandleScroll);
    isListening = true;
  };

  const disableScrollHide = () => {
    if (!isListening) {
      return;
    }

    removeScrollListener?.();
    removeScrollListener = null;

    showNav();
    isListening = false;
  };

  const handleScreenSizeChange = (mobile: boolean) => {
    if (mobile) {
      enableScrollHide();
    } else {
      disableScrollHide();
    }
  };

  handleScreenSizeChange(isMobile());

  onScreenSizeChange(handleScreenSizeChange);
})();
