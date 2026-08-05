import { registerPanel, closeAllExcept } from "./panel-coordinator";
import { lockScroll, unlockScroll } from "./scroll-lock";

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
      panel.classList.remove("is-open");
      panel
        .querySelector<HTMLButtonElement>(config.triggerSelector)
        ?.setAttribute("aria-expanded", "false");
      panel.querySelector<HTMLElement>(config.modalSelector)?.setAttribute("aria-hidden", "true");
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
