import { ITEM_SELECTOR, PANEL_SELECTOR } from "./mega-menu-constants";
import type { MegaMenuController } from "./mega-menu-controller";

const isFocusStayingInsideOpenPanel = (nav: HTMLElement, nextFocus: Node | null): boolean => {
  const openItem = nav.querySelector<HTMLElement>(`${ITEM_SELECTOR}.is-active`);
  const openPanel = nav.querySelector<HTMLElement>(`${PANEL_SELECTOR}.is-open`);
  return (
    !!nextFocus &&
    ((!!openItem && openItem.contains(nextFocus)) || (!!openPanel && openPanel.contains(nextFocus)))
  );
};

export const bindNavPointerEvents = (nav: HTMLElement, controller: MegaMenuController): void => {
  nav.addEventListener("mouseenter", controller.cancelClose);
  nav.addEventListener("mouseleave", () => {
    controller.cancelSwitch();
    controller.scheduleClose();
  });
};

export const bindBackdrop = (
  backdrop: HTMLElement | null,
  controller: MegaMenuController
): void => {
  backdrop?.addEventListener("click", () => {
    controller.cancelClose();
    controller.cancelSwitch();
    controller.closeAll();
  });
};

export const bindFocusOut = (nav: HTMLElement, controller: MegaMenuController): void => {
  nav.addEventListener("focusout", (event) => {
    if (!controller.hasOpenPanel()) {
      return;
    }
    if (!isFocusStayingInsideOpenPanel(nav, event.relatedTarget as Node | null)) {
      controller.closeAll();
    }
  });
};

export const bindEscapeKey = (controller: MegaMenuController): void => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      controller.cancelClose();
      controller.cancelSwitch();
      controller.closeAll();
    }
  });
};
