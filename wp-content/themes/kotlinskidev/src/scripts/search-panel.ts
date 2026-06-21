import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";

document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll<HTMLElement>(".kt-search-panel");
  if (!panels.length) return;

  const closeAll = () => {
    panels.forEach((panel) => {
      panel.classList.remove("is-open");
      panel
        .querySelector<HTMLButtonElement>(".kt-search-panel__trigger")
        ?.setAttribute("aria-expanded", "false");
      panel
        .querySelector<HTMLElement>(".kt-search-panel__modal")
        ?.setAttribute("aria-hidden", "true");
    });
  };

  registerPanel(closeAll);

  panels.forEach((panel) => {
    const trigger = panel.querySelector<HTMLButtonElement>(".kt-search-panel__trigger");
    const modal = panel.querySelector<HTMLElement>(".kt-search-panel__modal");

    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains("is-open");
      closeAll();
      if (!isOpen) {
        closeAllExcept(closeAll);
        panel.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        modal?.setAttribute("aria-hidden", "false");
        modal?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      }
    });

    modal?.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  document.addEventListener("click", () => {
    if (!panels.length || [...panels].some((p) => p.contains(document.activeElement))) return;
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
});
