import { debounce, isMobile, onScreenSizeChange } from "./utils";

(function () {
  const header = document.querySelector("header") as HTMLElement;
  const mobileFooterNav = document.querySelector(".mobile-footer-nav") as HTMLElement;
  const scrollToTop = document.querySelector(".kotlinskidev-scrollto-top") as HTMLElement;

  if (!header && !mobileFooterNav) return;

  let lastScrollTop = 0;
  const scrollThreshold = 10;
  const topThreshold = 100;

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

  const handleScroll = () => {
    const scrollTop = document.body.scrollTop || window.scrollY;
    const scrollDirection = scrollTop > lastScrollTop ? "down" : "up";
    const scrollDiff = Math.abs(scrollTop - lastScrollTop);

    if (scrollDiff < scrollThreshold) return;

    if (scrollTop < topThreshold) {
      if (header) header.classList.remove("nav-hidden");
      if (mobileFooterNav) mobileFooterNav.classList.remove("nav-hidden");
      if (scrollToTop) scrollToTop.classList.remove("mobile-nav-hidden");
      toggleCookieButtonClass(false);
      lastScrollTop = scrollTop;
      return;
    }

    if (scrollDirection === "down") {
      if (header) header.classList.add("nav-hidden");
      if (mobileFooterNav) mobileFooterNav.classList.add("nav-hidden");
      if (scrollToTop) scrollToTop.classList.add("mobile-nav-hidden");
      toggleCookieButtonClass(true);
    } else {
      if (header) header.classList.remove("nav-hidden");
      if (mobileFooterNav) mobileFooterNav.classList.remove("nav-hidden");
      if (scrollToTop) scrollToTop.classList.remove("mobile-nav-hidden");
      toggleCookieButtonClass(false);
    }

    lastScrollTop = scrollTop;
  };

  const debouncedHandleScroll = debounce(handleScroll, 10);
  let isListening = false;

  const enableScrollHide = () => {
    if (isListening) return;

    handleScroll();

    document.body.addEventListener("scroll", debouncedHandleScroll, {
      passive: true,
    });
    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    isListening = true;
  };

  const disableScrollHide = () => {
    if (!isListening) return;

    document.body.removeEventListener("scroll", debouncedHandleScroll);
    window.removeEventListener("scroll", debouncedHandleScroll);

    if (header) header.classList.remove("nav-hidden");
    if (mobileFooterNav) mobileFooterNav.classList.remove("nav-hidden");
    if (scrollToTop) scrollToTop.classList.remove("mobile-nav-hidden");
    toggleCookieButtonClass(false);
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
