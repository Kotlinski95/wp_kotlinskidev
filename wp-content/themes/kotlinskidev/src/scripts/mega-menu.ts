document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector<HTMLElement>(".kt-mega-nav");
  if (!nav) return;

  const items = nav.querySelectorAll<HTMLElement>(".kt-mega-nav__item");
  const panels = nav.querySelectorAll<HTMLElement>(".kt-mega-nav__panel");
  const backdrop = nav.querySelector<HTMLElement>(".kt-mega-nav__backdrop");
  const header = document.querySelector<HTMLElement>("header");
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelClose = () => {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const closeAll = () => {
    header?.classList.add("no-transition");
    nav
      .querySelectorAll<HTMLElement>(".kt-mega-nav__item.is-active")
      .forEach((t) => t.classList.remove("is-active"));
    nav
      .querySelectorAll<HTMLElement>(".kt-mega-nav__panel.is-open")
      .forEach((p) => p.classList.remove("is-open"));
    nav.classList.remove("has-open-panel");
    document.documentElement.classList.remove("has-modal-open");
    requestAnimationFrame(() => header?.classList.remove("no-transition"));
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(() => {
      if (!nav.contains(document.activeElement)) closeAll();
    }, 150);
  };

  const openPanel = (panelId: string) => {
    cancelClose();
    closeAll();
    nav.querySelector(`.kt-mega-nav__item[data-panel="${panelId}"]`)?.classList.add("is-active");
    nav.querySelector(`.kt-mega-nav__panel[data-panel="${panelId}"]`)?.classList.add("is-open");
    nav.classList.add("has-open-panel");
    document.documentElement.classList.add("has-modal-open");
  };

  items.forEach((item) => {
    const panelId = item.dataset.panel;

    if (panelId) {
      item
        .querySelector<HTMLAnchorElement>(".kt-mega-nav__link")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          if (item.classList.contains("is-active")) {
            closeAll();
          } else {
            openPanel(panelId);
          }
        });
    }

    item.addEventListener("mouseenter", () => {
      if (panelId) {
        openPanel(panelId);
      } else {
        cancelClose();
        closeAll();
      }
    });
  });

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);
  });

  nav.addEventListener("mouseenter", cancelClose);
  nav.addEventListener("mouseleave", scheduleClose);

  backdrop?.addEventListener("click", () => {
    cancelClose();
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cancelClose();
      closeAll();
    }
  });
});
