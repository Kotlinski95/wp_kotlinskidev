import { loadDeferredImages } from "@utils/load-deferred-images";
import {
  FOCUSABLE_SELECTOR,
  LINK_SELECTOR,
  OPEN_DELAY,
  SWITCH_DELAY,
  panelSelectorFor,
} from "./mega-menu-constants";
import type { MegaMenuController } from "./mega-menu-controller";

const isRealNavigationHref = (href: string, linkNavigates: boolean): boolean =>
  linkNavigates && href !== "" && href !== "#" && !href.startsWith("#");

const bindTrigger = (
  nav: HTMLElement,
  item: HTMLElement,
  panelId: string,
  controller: MegaMenuController
): void => {
  const trigger = item.querySelector<HTMLAnchorElement>(LINK_SELECTOR);
  const linkNavigates = nav.hasAttribute("data-link-navigates");

  const togglePanel = (): void => {
    if (item.classList.contains("is-active")) {
      controller.closeAll();
    } else {
      controller.openPanel(panelId);
    }
  };

  trigger?.addEventListener("click", (event) => {
    const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href") ?? "";
    if (isRealNavigationHref(href, linkNavigates)) {
      return;
    }
    event.preventDefault();
    togglePanel();
  });

  trigger?.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      togglePanel();
    } else if (event.key === "Tab" && !event.shiftKey && item.classList.contains("is-active")) {
      const panel = nav.querySelector<HTMLElement>(panelSelectorFor(panelId));
      const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });
};

const bindHover = (
  nav: HTMLElement,
  item: HTMLElement,
  panelId: string | undefined,
  controller: MegaMenuController
): void => {
  const warmPanelImages = (): void => {
    const panel = panelId ? nav.querySelector<HTMLElement>(panelSelectorFor(panelId)) : null;
    if (panel) {
      loadDeferredImages(panel);
    }
  };
  item.addEventListener("focusin", warmPanelImages);

  item.addEventListener("mouseenter", () => {
    warmPanelImages();
    controller.cancelClose();
    controller.cancelSwitch();
    if (panelId) {
      if (!item.classList.contains("is-active")) {
        const delay = controller.hasOpenPanel() ? SWITCH_DELAY : OPEN_DELAY;
        controller.scheduleOpen(panelId, delay);
      }
    } else if (controller.hasOpenPanel()) {
      controller.scheduleClose();
    }
  });

  item.addEventListener("mouseleave", controller.cancelSwitch);
};

export const bindItem = (
  nav: HTMLElement,
  item: HTMLElement,
  controller: MegaMenuController
): void => {
  const panelId = item.dataset.panel;
  if (panelId) {
    bindTrigger(nav, item, panelId, controller);
  }
  bindHover(nav, item, panelId, controller);
};
