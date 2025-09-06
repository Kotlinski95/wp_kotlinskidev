// Critical JavaScript - loads immediately to prevent layout shifts and flashes
import "./critical.scss"; // Import critical CSS
import "./scripts/theme-switcher";
import "./scripts/parallax";
import "./scripts/restoration";
import "./scripts/utils";


// Critical DOM ready functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add loaded class as soon as possible to prevent layout shifts
  document.body.classList.add("loaded");
});

// Immediately check and apply saved theme to prevent flash
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-mode');
    document.body?.classList?.add('light-mode');
  } else {
    document.documentElement.classList.add('dark-mode');
    document.body?.classList?.add('dark-mode');
  }
})();
