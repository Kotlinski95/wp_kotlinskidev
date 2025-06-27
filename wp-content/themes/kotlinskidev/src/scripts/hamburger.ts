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
})();
