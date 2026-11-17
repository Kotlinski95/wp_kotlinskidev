import "@utils/webpack-public-path";
import "./index.scss";
import "./scripts/hamburger";
import "./scripts/mega-menu";
import "./scripts/nav-reveal";
import "./scripts/search-panel";
import "./scripts/language-panel";
import "./scripts/scroll-to-top";
import "./scripts/language";
import "./scripts/scroll-animations";
import "./scripts/smooth-scroll-offset";
import "./scripts/cookie-consent";
import "./scripts/accessibility";
import "./scripts/page-views";
import "./scripts/hide-nav-on-scroll";
import "./scripts/visual-viewport-offset";
import "./scripts/group-link";
import "./scripts/cover-video-controls";
import "./scripts/responsive-media";
import "./scripts/analytics";
import "./scripts/active-link-state";
import "./scripts/viewport-deferred-images";
import "./scripts/parallax-deferred-bg";
import { loadWhenPresent } from "@utils/load-when-present";
import { whenIdle } from "@utils/when-idle";

loadWhenPresent(".wp-block-image", () => import("./scripts/image-lightbox"));
loadWhenPresent(".animated-counter", () => import("./scripts/animated-counter"));
loadWhenPresent(".wp-block-details", () => import("./scripts/faq-accordion"));
loadWhenPresent(".kt-line-clamp-toggle", () => import("./scripts/line-clamp"));
loadWhenPresent(
  '[data-kt-modal-target], a[href^="#kt-modal-"], .kt-modal',
  () => import("./scripts/modal-manager")
);
loadWhenPresent("[data-city-map-expand]", () => import("./scripts/city-map-lightbox"));
loadWhenPresent("[data-kt-load-more-initial]", () => import("./scripts/load-more"));
loadWhenPresent(".has-enhanced-hover-glow", () => import("./scripts/hover-glow"));
loadWhenPresent(
  '[data-protected="true"], [data-protection-type], .kt-copy-btn',
  () => import("./scripts/protected-content")
);

whenIdle(() => {
  void import("./scripts/recently-viewed");
  void import("./scripts/console-banner").then(({ logConsoleBanner }) => logConsoleBanner());
});
