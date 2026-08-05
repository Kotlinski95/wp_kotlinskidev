import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const LOCK_OWNER = "hamburger";

const getSubmenuContainer = (toggle: HTMLButtonElement): HTMLElement | null =>
  toggle
    .closest(".wp-block-navigation-item")
    ?.querySelector<HTMLElement>(":scope > .wp-block-navigation__submenu-container") ?? null;

const collapseSubmenuTree = (submenu: HTMLElement) => {
  submenu
    .querySelectorAll<HTMLElement>("a, button")
    .forEach((el) => el.setAttribute("tabindex", "-1"));
  submenu
    .querySelectorAll<HTMLButtonElement>(".wp-block-navigation-submenu__toggle")
    .forEach((t) => t.setAttribute("aria-expanded", "false"));
};

const setSubmenuTabbable = (toggle: HTMLButtonElement, expanded: boolean) => {
  const submenu = getSubmenuContainer(toggle);
  if (!submenu) {
    return;
  }
  if (expanded) {
    submenu
      .querySelectorAll<HTMLElement>(
        ":scope > .wp-block-navigation-item > .wp-block-navigation-item__content, :scope > .wp-block-navigation-item > .wp-block-navigation-submenu__toggle"
      )
      .forEach((el) => el.setAttribute("tabindex", "0"));
  } else {
    collapseSubmenuTree(submenu);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLButtonElement>(".wp-block-navigation-submenu__toggle")
    .forEach((toggle) => {
      setSubmenuTabbable(toggle, toggle.getAttribute("aria-expanded") === "true");
    });

  document
    .querySelectorAll<HTMLElement>(".wp-block-navigation__responsive-container")
    .forEach((container) => {
      let wasOpen = container.classList.contains("is-menu-open");
      if (wasOpen) {
        lockScroll(LOCK_OWNER);
      }

      container.addEventListener("transitionend", (e) => {
        if (e.target === container && e.propertyName === "max-width") {
          container.classList.remove("kt-nav-panel-animating");
        }
      });

      const observer = new MutationObserver(() => {
        const isOpen = container.classList.contains("is-menu-open");
        if (isOpen && !wasOpen) {
          lockScroll(LOCK_OWNER);
          container.classList.add("kt-nav-panel-animating");
          const closeBtn = container
            .closest(".wp-block-navigation")
            ?.querySelector<HTMLButtonElement>(".wp-block-navigation__responsive-container-close");
          closeBtn?.focus();
          const redirectInitialFocus = (e: FocusEvent) => {
            container.removeEventListener("focusin", redirectInitialFocus);
            if (e.target !== closeBtn) {
              closeBtn?.focus();
            }
          };
          container.addEventListener("focusin", redirectInitialFocus);
        } else if (!isOpen && wasOpen) {
          unlockScroll(LOCK_OWNER);
          container.classList.add("kt-nav-panel-animating");
        }
        wasOpen = isOpen;
      });

      observer.observe(container, { attributes: true, attributeFilter: ["class"] });
    });

  const closeHamburger = () => {
    document
      .querySelectorAll<HTMLElement>(
        ".wp-block-navigation:has(.wp-block-navigation__responsive-container.is-menu-open)"
      )
      .forEach((nav) => {
        nav
          .querySelector<HTMLButtonElement>(".wp-block-navigation__responsive-container-close")
          ?.click();
      });
  };

  registerPanel(closeHamburger);

  document
    .querySelectorAll<HTMLButtonElement>(".wp-block-navigation__responsive-container-open")
    .forEach((openBtn) => {
      const nav = openBtn.closest(".wp-block-navigation");
      const closeBtn = nav?.querySelector<HTMLButtonElement>(
        ".wp-block-navigation__responsive-container-close"
      );
      if (closeBtn) {
        openBtn.insertAdjacentElement("afterend", closeBtn);
        closeBtn.addEventListener("mousedown", (e) => e.preventDefault());
      }

      openBtn.addEventListener("click", () => {
        const isOpen = !!nav?.querySelector(
          ".wp-block-navigation__responsive-container.is-menu-open"
        );
        if (!isOpen) {
          closeAllExcept(closeHamburger);
        }
      });
    });

  document.addEventListener(
    "click",
    (e) => {
      const toggle = (e.target as Element).closest<HTMLButtonElement>(
        ".wp-block-navigation-submenu__toggle"
      );
      if (!toggle) {
        return;
      }
      e.stopImmediatePropagation();
      const parentContainer = toggle.closest(
        ".wp-block-navigation__submenu-container, .wp-block-navigation__container"
      );
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      parentContainer
        ?.querySelectorAll<HTMLButtonElement>(
          ":scope > .wp-block-navigation-item > .wp-block-navigation-submenu__toggle[aria-expanded='true']"
        )
        .forEach((t) => {
          if (t !== toggle) {
            t.setAttribute("aria-expanded", "false");
            setSubmenuTabbable(t, false);
          }
        });
      toggle.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      setSubmenuTabbable(toggle, !isExpanded);
    },
    { capture: true }
  );
});
