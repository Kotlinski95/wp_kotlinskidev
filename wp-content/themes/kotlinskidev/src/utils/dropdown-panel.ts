import { registerPanel, closeAllExcept } from "./panel-coordinator";
import { lockScroll, unlockScroll } from "./scroll-lock";
import { dispatchNavPanelOpen, dispatchNavPanelClose } from "./nav-reveal-events";

interface DropdownPanelConfig {
  rootSelector: string;
  triggerSelector: string;
  modalSelector: string;
  onOpen?: (modal: HTMLElement) => void;
}

export function initDropdownPanels(config: DropdownPanelConfig): void {
  const panels = document.querySelectorAll<HTMLElement>(config.rootSelector);
  if (!panels.length) {
    return;
  }

  const closeAll = () => {
    panels.forEach((panel) => {
      const wasOpen = panel.classList.contains("is-open");
      panel.classList.remove("is-open");
      panel
        .querySelector<HTMLButtonElement>(config.triggerSelector)
        ?.setAttribute("aria-expanded", "false");
      const modal = panel.querySelector<HTMLElement>(config.modalSelector);
      modal?.setAttribute("aria-hidden", "true");
      if (wasOpen && modal) {
        dispatchNavPanelClose(modal);
      }
    });
    unlockScroll(config.rootSelector);
  };

  registerPanel(closeAll);

  panels.forEach((panel) => {
    const trigger = panel.querySelector<HTMLButtonElement>(config.triggerSelector);
    const modal = panel.querySelector<HTMLElement>(config.modalSelector);

    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains("is-open");
      closeAll();
      if (!isOpen) {
        closeAllExcept(closeAll);
        panel.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        modal?.setAttribute("aria-hidden", "false");
        lockScroll(config.rootSelector);
        if (modal) {
          dispatchNavPanelOpen(modal);
          config.onOpen?.(modal);
        }
      }
    });

    modal?.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  document.addEventListener("click", () => {
    if ([...panels].some((p) => p.contains(document.activeElement))) {
      return;
    }
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAll();
    }
  });
}
