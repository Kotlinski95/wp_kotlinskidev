import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";

document.addEventListener("DOMContentLoaded", () => {
  const closeHamburger = () => {
    document
      .querySelectorAll<HTMLButtonElement>(
        ".wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close"
      )
      .forEach((btn) => btn.click());
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
      if (!toggle) return;
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
          if (t !== toggle) t.setAttribute("aria-expanded", "false");
        });
      toggle.setAttribute("aria-expanded", isExpanded ? "false" : "true");
    },
    { capture: true }
  );
});
