// accessibility.ts
// Adds accessible submenu toggles to WordPress navigation menus

document.addEventListener('DOMContentLoaded', () => {
  // Hide CSS-only arrows if JS is enabled
  document.body.classList.add('accessibility-js-enabled');

  // Select all menu items with submenus
  const menuItems = document.querySelectorAll('.menu-item-has-children');

  menuItems.forEach((item) => {
    // Find the first link inside the menu item
    const link = item.querySelector('a');
    const submenu = item.querySelector('.sub-menu');
    if (!link || !submenu) return;

    // Create a button for toggling submenu
    const toggleBtn = document.createElement('button');
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('tabindex', '0');
    toggleBtn.className = 'submenu-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle submenu');

    // Use the same arrow as in CSS :after
    toggleBtn.innerHTML = '&#x25be;';

    // Insert the button after the link
    link.insertAdjacentElement('afterend', toggleBtn);

    // Helper to set submenu links and inner toggles tabindex
    const setSubmenuTabbables = (active: boolean) => {
      // Set all submenu links
      const subLinks = submenu.querySelectorAll('a');
      subLinks.forEach(link => {
        link.setAttribute('tabindex', active ? '0' : '-1');
      });
      // Set all inner submenu-toggle buttons
      const innerToggles = submenu.querySelectorAll('.submenu-toggle');
      innerToggles.forEach(btn => {
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
    };

    // Toggle submenu on click or keyboard
    const toggleSubmenu = () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('submenu-active', !expanded);
      setSubmenuTabbables(!expanded);
      if (!expanded) {
        // Focus first submenu link when opened
        const firstSubLink = submenu.querySelector('a');
        if (firstSubLink) firstSubLink.focus();
      }
    };

    // Listen for 'Escape' key on submenu links and toggles
    submenu.addEventListener('keydown', (e) => {
      const event = e as KeyboardEvent;
      if (event.key === 'Escape') {
        toggleBtn.setAttribute('aria-expanded', 'false');
        item.classList.remove('submenu-active');
        setSubmenuTabbables(false);
        toggleBtn.focus();
      }
    });

    // Initialize submenu links and toggles as not focusable
    setSubmenuTabbables(false);

    toggleBtn.addEventListener('click', toggleSubmenu);
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleSubmenu();
      }
    });

    // Close submenu when focus leaves submenu or its links/toggles
    submenu.addEventListener('focusout', (e) => {
      setTimeout(() => {
        if (!submenu.contains(document.activeElement)) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          item.classList.remove('submenu-active');
          setSubmenuTabbables(false);
        }
      }, 0);
    });
  });
});
