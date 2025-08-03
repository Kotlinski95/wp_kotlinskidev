// /src/scripts/hamburger.ts
(function () {
  const navigationMenu = document.getElementById("hamburger-menu");
  const hamburgerCheckbox = document.querySelector(
    "input[name=hamburger-toggle]"
  );
  const hamburgerContainer = document.querySelector(".hamburger-container");

  if (!hamburgerCheckbox || !navigationMenu) return;

  hamburgerCheckbox.addEventListener(
    "change",
    function (this: HTMLInputElement) {
      if (this.checked) {
        navigationMenu.classList.add("open");
        document.body.classList.add("scroll-lock");
      } else {
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
      }
    }
  );

  // Submenu toggle functionality
  if (hamburgerContainer) {
    const submenuItems = hamburgerContainer.querySelectorAll(
      ".menu-item-has-children"
    );
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

  // Close hamburger menu when clicking outside
  document.addEventListener("click", function (e) {
    const target = e.target as Element;
    const hamburgerButton = document.querySelector(".hamburger-menu");
    const header = document.querySelector("header");
    
    // Check if menu is open
    if (navigationMenu.classList.contains("open")) {
      // Don't close if clicking on hamburger button or its children
      if (hamburgerButton && (hamburgerButton.contains(target) || hamburgerButton === target)) {
        return;
      }
      
      // Don't close if clicking anywhere in the header area
      if (header && (header.contains(target) || header === target)) {
        return;
      }
      
      // Don't close if clicking inside the hamburger menu or its children
      if (navigationMenu.contains(target) || navigationMenu === target) {
        return;
      }
      
      // Close the menu
      if (hamburgerCheckbox instanceof HTMLInputElement) {
        hamburgerCheckbox.checked = false;
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
      }
    }
  });

  // Close hamburger menu on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navigationMenu.classList.contains("open")) {
      if (hamburgerCheckbox instanceof HTMLInputElement) {
        hamburgerCheckbox.checked = false;
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
      }
    }
  });
})();
