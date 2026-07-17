const SWITCH_DELAY = 150;
const CLOSE_DELAY = 500;

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector<HTMLElement>(".kt-mega-nav");
  if (!nav) return;

  const items = nav.querySelectorAll<HTMLElement>(".kt-mega-nav__item");
  const panels = nav.querySelectorAll<HTMLElement>(".kt-mega-nav__panel");
  const backdrop = nav.querySelector<HTMLElement>(".kt-mega-nav__backdrop");
  const header = document.querySelector<HTMLElement>("header");
  const linkNavigates = nav.hasAttribute("data-link-navigates");
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let switchTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelClose = () => {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const cancelSwitch = () => {
    if (switchTimer !== null) {
      clearTimeout(switchTimer);
      switchTimer = null;
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
    }, CLOSE_DELAY);
  };

  const openPanel = (panelId: string) => {
    cancelClose();
    cancelSwitch();
    closeAll();
    nav.querySelector(`.kt-mega-nav__item[data-panel="${panelId}"]`)?.classList.add("is-active");
    nav.querySelector(`.kt-mega-nav__panel[data-panel="${panelId}"]`)?.classList.add("is-open");
    nav.classList.add("has-open-panel");
    document.documentElement.classList.add("has-modal-open");
  };

  const hasOpenPanel = () => nav.classList.contains("has-open-panel");

  items.forEach((item) => {
    const panelId = item.dataset.panel;

    if (panelId) {
      item
        .querySelector<HTMLAnchorElement>(".kt-mega-nav__link")
        ?.addEventListener("click", (e) => {
          const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href") ?? "";
          const isRealHref = linkNavigates && href !== "" && href !== "#" && !href.startsWith("#");
          if (isRealHref) return;
          e.preventDefault();
          if (item.classList.contains("is-active")) {
            closeAll();
          } else {
            openPanel(panelId);
          }
        });
    }

    item.addEventListener("mouseenter", () => {
      cancelClose();
      cancelSwitch();
      if (panelId) {
        if (!hasOpenPanel()) {
          openPanel(panelId);
        } else if (!item.classList.contains("is-active")) {
          switchTimer = setTimeout(() => openPanel(panelId), SWITCH_DELAY);
        }
      } else if (hasOpenPanel()) {
        scheduleClose();
      }
    });

    item.addEventListener("mouseleave", cancelSwitch);
  });

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      cancelClose();
      cancelSwitch();
    });
    panel.addEventListener("mouseleave", scheduleClose);
  });

  nav.addEventListener("mouseenter", cancelClose);
  nav.addEventListener("mouseleave", () => {
    cancelSwitch();
    scheduleClose();
  });

  backdrop?.addEventListener("click", () => {
    cancelClose();
    cancelSwitch();
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cancelClose();
      cancelSwitch();
      closeAll();
    }
  });
});
