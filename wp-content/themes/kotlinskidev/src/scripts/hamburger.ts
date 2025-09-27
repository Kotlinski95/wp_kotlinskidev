// /src/scripts/hamburger.ts
(function () {
  const navigationMenu = document.getElementById("hamburger-menu");
  const hamburgerCheckbox = document.querySelector(
    "input[name=hamburger-toggle]"
  );
  const hamburgerContainer = document.querySelector(".hamburger-container");

  if (!hamburgerCheckbox || !navigationMenu) return;

  // Helper to set all links and buttons in #hamburger-menu tabbable or not
  const setHamburgerMenuTabbables = (active: boolean) => {
    if (!navigationMenu) return;
    // Top-level tabbables
    const tabbables = navigationMenu.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    tabbables.forEach(el => {
      // If inside a submenu that is not active, set tabindex -1
      const parentMenuItem = el.closest('.menu-item-has-children');
      const isSubmenu = parentMenuItem && el.closest('.sub-menu');
      if (isSubmenu && !parentMenuItem.classList.contains('submenu-active')) {
        el.setAttribute('tabindex', '-1');
      } else {
        el.setAttribute('tabindex', active ? '0' : '-1');
      }
    });
  };

  // Initially make all hamburger menu items not focusable
  setHamburgerMenuTabbables(false);

  hamburgerCheckbox.addEventListener(
    "change",
    function (this: HTMLInputElement) {
      if (this.checked) {
        navigationMenu.classList.add("open");
        document.body.classList.add("scroll-lock");
        setHamburgerMenuTabbables(true);
      } else {
        navigationMenu.classList.remove("open");
        document.body.classList.remove("scroll-lock");
        setHamburgerMenuTabbables(false);
      }
    }
  );

  // Keyboard accessibility for #hamburger-button
  const hamburgerButton = document.getElementById('hamburger-button');
  if (hamburgerButton) {
    hamburgerButton.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (hamburgerCheckbox instanceof HTMLInputElement) {
          hamburgerCheckbox.checked = !hamburgerCheckbox.checked;
          hamburgerCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }

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
        setHamburgerMenuTabbables(false);
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
        setHamburgerMenuTabbables(false);
        if (hamburgerButton) {
          hamburgerButton.focus();
        }
      }
    }
  });

  // Close hamburger menu when focus leaves the menu
  navigationMenu.addEventListener('focusout', function () {
    setTimeout(() => {
      if (!navigationMenu.contains(document.activeElement) && navigationMenu.classList.contains('open')) {
        if (hamburgerCheckbox instanceof HTMLInputElement) {
          hamburgerCheckbox.checked = false;
          navigationMenu.classList.remove('open');
          document.body.classList.remove('scroll-lock');
          setHamburgerMenuTabbables(false);
        }
      }
    }, 0);
  });
})();
