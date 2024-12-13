// /src/scripts/hamburger.ts
(function () {
    const navigationMenu = document.getElementById('hamburger-menu');
    const hamburgerCheckbox = document.querySelector('input[name=hamburger-toggle]');
  
    if (!hamburgerCheckbox || !navigationMenu) return;
  
    hamburgerCheckbox.addEventListener('change', function (this: HTMLInputElement) {
      if (this.checked) {
        navigationMenu.classList.add('open');
        document.body.classList.add('scroll-lock');
      } else {
        navigationMenu.classList.remove('open');
        document.body.classList.remove('scroll-lock');
      }
    });
  })();
  