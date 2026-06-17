document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLButtonElement>(".wp-block-navigation__responsive-container-open")
    .forEach((openBtn) => {
      openBtn.addEventListener(
        "click",
        (e) => {
          const nav = openBtn.closest(".wp-block-navigation");
          const openContainer = nav?.querySelector<HTMLElement>(
            ".wp-block-navigation__responsive-container.is-menu-open"
          );
          if (!openContainer) return;
          e.stopPropagation();
          openContainer
            .querySelector<HTMLButtonElement>(".wp-block-navigation__responsive-container-close")
            ?.click();
        },
        { capture: true }
      );
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
