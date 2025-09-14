import "./index.scss";
import "./scripts/hamburger";
import "./scripts/scroll-to-top";
import "./scripts/language";
import "./scripts/scroll-animations";
import "./scripts/image-lightbox";
import "./scripts/smooth-scroll-offset";
import "./scripts/protected-content";
import "./scripts/cookie-consent";

document.addEventListener("DOMContentLoaded", function () {
  // Note: body.loaded class is now added in critical.js for faster loading

  // Enhanced developer console guide
  console.log(
    "%c🚀 Welcome to KotlinskiDev!",
    'font-size: 28px; color: #6366f1; font-weight: bold; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; text-shadow: 2px 2px 4px rgba(99, 102, 241, 0.3);'
  );

  console.log(
    "%c📚 Developer Guide & Site Information",
    'font-size: 20px; color: #8b5cf6; font-weight: 600; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin-top: 10px;'
  );

  console.log(
    "%c┌─────────────────────────────────────────────────────────────",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│  🏗️  TECH STACK",
    "color: #7c3aed; font-family: monospace; font-size: 14px; font-weight: bold;"
  );

  console.log(
    "%c│  • WordPress Custom Theme\n%c│  • TypeScript & Modern JavaScript\n%c│  • SCSS with custom styling\n%c│  • Responsive design with mobile-first approach\n%c│  • Dark/Light theme switcher\n%c│  • Custom Gutenberg blocks",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│  🎨  FEATURES",
    "color: #7c3aed; font-family: monospace; font-size: 14px; font-weight: bold;"
  );

  console.log(
    "%c│  • Interactive hamburger navigation\n%c│  • Smooth scroll animations\n%c│  • Language switcher (multilingual support)\n%c│  • Image lightbox functionality\n%c│  • Scroll-to-top button\n%c│  • SEO optimized structure",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;",
    "color: #8b5cf6; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│  🔧  DEVELOPMENT",
    "color: #7c3aed; font-family: monospace; font-size: 14px; font-weight: bold;"
  );

  console.log(
    "%c│  • Built with modern web standards\n%c│  • Optimized for performance\n%c│  • Cross-browser compatibility\n%c│  • Accessibility features included\n%c│  • Custom post types & fields support",
    "color: #a855f7; font-family: monospace; font-size: 12px;",
    "color: #a855f7; font-family: monospace; font-size: 12px;",
    "color: #a855f7; font-family: monospace; font-size: 12px;",
    "color: #a855f7; font-family: monospace; font-size: 12px;",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c│  📁  FILE STRUCTURE",
    "color: #7c3aed; font-family: monospace; font-size: 14px; font-weight: bold;"
  );

  console.log(
    "%c│  src/\n%c│  ├── scripts/          # TypeScript modules\n%c│  ├── styles/           # SCSS stylesheets\n%c│  ├── blocks/           # Custom Gutenberg blocks\n%c│  └── index.ts          # Main entry point",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;",
    "color: #6366f1; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c└─────────────────────────────────────────────────────────────",
    "color: #a855f7; font-family: monospace; font-size: 12px;"
  );

  console.log(
    "%c💡 Tip: Open DevTools → Sources to explore the codebase!",
    'font-size: 14px; color: #3b82f6; font-weight: 500; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 100%); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #6366f1;'
  );

  console.log(
    "%c🌐 Want to connect? Check out the footer for social links!",
    'font-size: 14px; color: #7c3aed; font-weight: 500; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f3e8ff 0%, #ddd6fe 100%); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #8b5cf6;'
  );

  // Bonus: Site performance info
  if (window.performance && window.performance.timing) {
    const loadTime =
      window.performance.timing.loadEventEnd -
      window.performance.timing.navigationStart;
    console.log(
      `%c⚡ Site loaded in ${loadTime}ms`,
      "font-size: 12px; color: #059669; font-weight: 600; font-family: monospace; background-color: #ecfdf5; padding: 4px 8px; border-radius: 4px;"
    );
  }
});
