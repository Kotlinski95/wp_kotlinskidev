import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const OPEN_DELAY = 500;
const SWITCH_DELAY = 500;
const CLOSE_DELAY = 500;
const LOCK_OWNER = "mega-menu";

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector<HTMLElement>(".kt-mega-nav");
  if (!nav) {
    return;
  }

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
    nav.querySelectorAll<HTMLElement>(".kt-mega-nav__item.is-active").forEach((t) => {
      t.classList.remove("is-active");
      t.querySelector(".kt-mega-nav__link")?.setAttribute("aria-expanded", "false");
    });
    nav
      .querySelectorAll<HTMLElement>(".kt-mega-nav__panel.is-open")
      .forEach((p) => p.classList.remove("is-open"));
    nav.classList.remove("has-open-panel");
    unlockScroll(LOCK_OWNER);
    requestAnimationFrame(() => header?.classList.remove("no-transition"));
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(() => {
      if (!nav.contains(document.activeElement)) {
        closeAll();
      }
    }, CLOSE_DELAY);
  };

  const openPanel = (panelId: string) => {
    cancelClose();
    cancelSwitch();
    closeAll();
    const item = nav.querySelector<HTMLElement>(`.kt-mega-nav__item[data-panel="${panelId}"]`);
    item?.classList.add("is-active");
    item?.querySelector(".kt-mega-nav__link")?.setAttribute("aria-expanded", "true");
    nav.querySelector(`.kt-mega-nav__panel[data-panel="${panelId}"]`)?.classList.add("is-open");
    nav.classList.add("has-open-panel");
    lockScroll(LOCK_OWNER);
  };

  const hasOpenPanel = () => nav.classList.contains("has-open-panel");

  items.forEach((item) => {
    const panelId = item.dataset.panel;

    if (panelId) {
      const trigger = item.querySelector<HTMLAnchorElement>(".kt-mega-nav__link");
      const togglePanel = () => {
        if (item.classList.contains("is-active")) {
          closeAll();
        } else {
          openPanel(panelId);
        }
      };
      trigger?.addEventListener("click", (e) => {
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href") ?? "";
        const isRealHref = linkNavigates && href !== "" && href !== "#" && !href.startsWith("#");
        if (isRealHref) {
          return;
        }
        e.preventDefault();
        togglePanel();
      });
      trigger?.addEventListener("keydown", (e) => {
        if (e.key === " ") {
          e.preventDefault();
          togglePanel();
        } else if (e.key === "Tab" && !e.shiftKey && item.classList.contains("is-active")) {
          const panelEl = nav.querySelector<HTMLElement>(
            `.kt-mega-nav__panel[data-panel="${panelId}"]`
          );
          const firstFocusable = panelEl?.querySelector<HTMLElement>(
            "a[href], button:not([disabled])"
          );
          if (firstFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });
    }

    item.addEventListener("mouseenter", () => {
      cancelClose();
      cancelSwitch();
      if (panelId) {
        if (!item.classList.contains("is-active")) {
          const delay = hasOpenPanel() ? SWITCH_DELAY : OPEN_DELAY;
          switchTimer = setTimeout(() => openPanel(panelId), delay);
        }
      } else if (hasOpenPanel()) {
        scheduleClose();
      }
    });

    item.addEventListener("mouseleave", cancelSwitch);
  });

  panels.forEach((panel) => {
    panel.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") {
        return;
      }
      const trigger = nav.querySelector<HTMLElement>(
        `.kt-mega-nav__item[data-panel="${panel.dataset.panel}"] .kt-mega-nav__link`
      );
      if (!trigger) {
        return;
      }

      const focusables = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (e.shiftKey && focusables[0] === e.target) {
        e.preventDefault();
        trigger.focus();
      } else if (!e.shiftKey && focusables[focusables.length - 1] === e.target) {
        e.preventDefault();
        closeAll();
        trigger.focus();
      }
    });

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

  nav.addEventListener("focusout", (e) => {
    if (!hasOpenPanel()) {
      return;
    }
    const nextFocus = e.relatedTarget as Node | null;
    const openItem = nav.querySelector<HTMLElement>(".kt-mega-nav__item.is-active");
    const openPanelEl = nav.querySelector<HTMLElement>(".kt-mega-nav__panel.is-open");
    const staysWithin =
      !!nextFocus &&
      ((openItem && openItem.contains(nextFocus)) ||
        (openPanelEl && openPanelEl.contains(nextFocus)));
    if (!staysWithin) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cancelClose();
      cancelSwitch();
      closeAll();
    }
  });
});
