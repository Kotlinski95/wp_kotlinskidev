import { isMobile, onAppShellChange, onScreenSizeChange } from "./utils";
import { createNavVisibility, findHideableNavElements } from "./hide-nav-on-scroll/nav-visibility";
import { createScrollDirectionHandler } from "./hide-nav-on-scroll/scroll-direction-handler";
import { createScrollHideListening } from "./hide-nav-on-scroll/scroll-listening";

const initHideNavOnScroll = (): void => {
  const elements = findHideableNavElements();
  if (!elements.header && !elements.mobileFooterNav) {
    return;
  }

  const navVisibility = createNavVisibility(elements);
  const listening = createScrollHideListening(
    createScrollDirectionHandler(navVisibility),
    navVisibility.showNav
  );

  const onScreenSizeUpdate = (mobile: boolean): void => {
    if (mobile) {
      listening.enable();
    } else {
      listening.disable();
    }
  };

  onScreenSizeUpdate(isMobile());
  onScreenSizeChange(onScreenSizeUpdate);
  onAppShellChange(navVisibility.showNav);
};

initHideNavOnScroll();
