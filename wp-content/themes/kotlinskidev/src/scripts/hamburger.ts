(function () {
  const navigationMenu = document.getElementById("hamburger-menu");
  const hamburgerCheckbox = document.querySelector("input[name=hamburger-toggle]");
  const hamburgerContainer = document.querySelector(".hamburger-container");

  if (!hamburgerCheckbox || !navigationMenu) return;

  const setHamburgerMenuTabbables = (active: boolean) => {
    if (!navigationMenu) return;
    const tabbables = navigationMenu.querySelectorAll(
      "a, button, input, select, textarea, [tabindex]"
    );
    tabbables.forEach((el) => {
      const parentMenuItem = el.closest(".menu-item-has-children");
      const isSubmenu = parentMenuItem && el.closest(".sub-menu");
      if (isSubmenu && !parentMenuItem.classList.contains("submenu-active")) {
        el.setAttribute("tabindex", "-1");
      } else {
        el.setAttribute("tabindex", active ? "0" : "-1");
      }
    });
  };

  setHamburgerMenuTabbables(false);

  hamburgerCheckbox.addEventListener("change", function (this: HTMLInputElement) {
    if (this.checked) {
      navigationMenu.classList.add("open");
      document.body.classList.add("scroll-lock");
      setHamburgerMenuTabbables(true);
    } else {
      navigationMenu.classList.remove("open");
      document.body.classList.remove("scroll-lock");
      setHamburgerMenuTabbables(false);
    }
  });

  const hamburgerButton = document.getElementById("hamburger-button");
  if (hamburgerButton) {
    hamburgerButton.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (hamburgerCheckbox instanceof HTMLInputElement) {
          hamburgerCheckbox.checked = !hamburgerCheckbox.checked;
          hamburgerCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
  }

  if (hamburgerContainer) {
    const submenuItems = hamburgerContainer.querySelectorAll(".menu-item-has-children");
    submenuItems.forEach((item) => {
      const link = item.querySelector("a");
      if (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          item?.classList.toggle("submenu-active");
        });
      }
    });
  }

  document.addEventListener("click", function (e) {
    const target = e.target as Element;
    const hamburgerButton = document.querySelector(".hamburger-menu");
    const header = document.querySelector("header");

    if (navigationMenu.classList.contains("open")) {
      if (hamburgerButton && (hamburgerButton.contains(target) || hamburgerButton === target)) {
        return;
      }

      if (header && (header.contains(target) || header === target)) {
        return;
      }

      if (navigationMenu.contains(target) || navigationMenu === target) {
        return;
      }
      if (hamburgerCheckbox instanceof HTMLInputElement) {
        hamburgerCheckbox.checked = false;
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
        setHamburgerMenuTabbables(false);
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navigationMenu.classList.contains("open")) {
      if (hamburgerCheckbox instanceof HTMLInputElement) {
        hamburgerCheckbox.checked = false;
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
        setHamburgerMenuTabbables(false);
        if (hamburgerButton) {
          hamburgerButton.focus();
        }
      }
    }
  });

  navigationMenu.addEventListener("focusout", function () {
    setTimeout(() => {
      if (
        !navigationMenu.contains(document.activeElement) &&
        navigationMenu.classList.contains("open")
      ) {
        if (hamburgerCheckbox instanceof HTMLInputElement) {
          hamburgerCheckbox.checked = false;
          navigationMenu.classList.remove("open");
          document.body.classList.remove("scroll-lock");
          setHamburgerMenuTabbables(false);
        }
      }
    }, 0);
  });
})();
