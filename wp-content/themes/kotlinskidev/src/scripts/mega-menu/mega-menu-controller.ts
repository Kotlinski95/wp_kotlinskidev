import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import { loadDeferredImages } from "@utils/load-deferred-images";
import { dispatchNavPanelOpen, dispatchNavPanelClose } from "@utils/nav-reveal-events";
import {
  CLOSE_DELAY,
  ITEM_SELECTOR,
  LINK_SELECTOR,
  LOCK_OWNER,
  PANEL_SELECTOR,
  itemSelectorFor,
  panelSelectorFor,
} from "./mega-menu-constants";

export interface MegaMenuController {
  closeAll: () => void;
  openPanel: (panelId: string) => void;
  hasOpenPanel: () => boolean;
  scheduleClose: () => void;
  scheduleOpen: (panelId: string, delay: number) => void;
  cancelClose: () => void;
  cancelSwitch: () => void;
}

export const createMegaMenuController = (nav: HTMLElement): MegaMenuController => {
  const header = document.querySelector<HTMLElement>("header");
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let switchTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelClose = (): void => {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const cancelSwitch = (): void => {
    if (switchTimer !== null) {
      clearTimeout(switchTimer);
      switchTimer = null;
    }
  };

  const closeAll = (): void => {
    header?.classList.add("no-transition");
    nav.querySelectorAll<HTMLElement>(`${ITEM_SELECTOR}.is-active`).forEach((item) => {
      item.classList.remove("is-active");
      item.querySelector(LINK_SELECTOR)?.setAttribute("aria-expanded", "false");
    });
    nav.querySelectorAll<HTMLElement>(`${PANEL_SELECTOR}.is-open`).forEach((panel) => {
      panel.classList.remove("is-open");
      dispatchNavPanelClose(panel);
    });
    nav.classList.remove("has-open-panel");
    unlockScroll(LOCK_OWNER);
    requestAnimationFrame(() => header?.classList.remove("no-transition"));
  };

  const scheduleClose = (): void => {
    cancelClose();
    closeTimer = setTimeout(() => {
      if (!nav.contains(document.activeElement)) {
        closeAll();
      }
    }, CLOSE_DELAY);
  };

  const openPanel = (panelId: string): void => {
    cancelClose();
    cancelSwitch();
    closeAll();
    const item = nav.querySelector<HTMLElement>(itemSelectorFor(panelId));
    item?.classList.add("is-active");
    item?.querySelector(LINK_SELECTOR)?.setAttribute("aria-expanded", "true");
    const panel = nav.querySelector<HTMLElement>(panelSelectorFor(panelId));
    panel?.classList.add("is-open");
    nav.classList.add("has-open-panel");
    lockScroll(LOCK_OWNER);
    if (panel) {
      loadDeferredImages(panel);
      dispatchNavPanelOpen(panel);
    }
  };

  const scheduleOpen = (panelId: string, delay: number): void => {
    switchTimer = setTimeout(() => openPanel(panelId), delay);
  };

  const hasOpenPanel = (): boolean => nav.classList.contains("has-open-panel");

  return {
    closeAll,
    openPanel,
    hasOpenPanel,
    scheduleClose,
    scheduleOpen,
    cancelClose,
    cancelSwitch,
  };
};
