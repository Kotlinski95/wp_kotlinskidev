import type { DrawContext, FeatureCanvasVariant } from "../types";
import { drawAppDashboard } from "./app-dashboard";
import { drawBenefitMarketing } from "./benefit-marketing";
import { drawBenefitSaas } from "./benefit-saas";
import { drawBenefitDesignSystem } from "./benefit-design-system";
import { drawBenefitApi } from "./benefit-api";
import { drawBrowserStream } from "./browser-stream";
import { drawCommerceConversion } from "./commerce-conversion";
import { drawCommerceScale } from "./commerce-scale";
import { drawCommerceSecure } from "./commerce-secure";
import { drawCommercePlatforms } from "./commerce-platforms";
import { drawChartGrowth } from "./chart-growth";
import { drawCheckoutFlow } from "./checkout-flow";
import { drawDotImageStack } from "./dot-image-stack";
import { drawLayoutBuilder } from "./layout-builder";
import { drawLoadWaterfall } from "./load-waterfall";
import { drawLocalSearch } from "./local-search";
import { drawNavAbout } from "./nav-about";
import { drawNavContact } from "./nav-contact";
import { drawNavProjects } from "./nav-projects";
import { drawNavServices } from "./nav-services";
import { drawNodeTree } from "./node-tree";
import { drawSiteScroll } from "./site-scroll";
import { drawSpeedGauge } from "./speed-gauge";
import { drawStorefront } from "./storefront";
import { drawSupportShield } from "./support-shield";
import { drawIllusStorefront } from "./illus-storefront";
import { drawIllusAudit } from "./illus-audit";
import { drawIllusMobileFirst } from "./illus-mobile-first";
import { drawIllusVitals } from "./illus-vitals";
import { drawIllusMobileCheckout } from "./illus-mobile-checkout";
import { drawIllusSeoGrowth } from "./illus-seo-growth";
import { drawIllusHandover } from "./illus-handover";
import { drawIllusAppServices } from "./illus-app-services";
import { drawVsFrameworks } from "./vs-frameworks";
import { drawPwaInstall } from "./pwa-install";
import { drawSsrSmartedit } from "./ssr-smartedit";
import { drawNextjsArchitecture } from "./nextjs-architecture";
import { drawPerfByDesign } from "./perf-by-design";
import { drawSmartShoppingList } from "./smart-shopping-list";
import { drawWpCustomTheme } from "./wp-custom-theme";
import { drawWpStackOwnership } from "./wp-stack-ownership";
import { drawWpFlexControl } from "./wp-flex-control";

export const variantRegistry: Record<FeatureCanvasVariant, (dc: DrawContext) => void> = {
  "browser-stream": drawBrowserStream,
  "node-tree": drawNodeTree,
  "dot-image-stack": drawDotImageStack,
  "chart-growth": drawChartGrowth,
  storefront: drawStorefront,
  "layout-builder": drawLayoutBuilder,
  "speed-gauge": drawSpeedGauge,
  "nav-about": drawNavAbout,
  "nav-projects": drawNavProjects,
  "nav-services": drawNavServices,
  "nav-contact": drawNavContact,
  "site-scroll": drawSiteScroll,
  "checkout-flow": drawCheckoutFlow,
  "app-dashboard": drawAppDashboard,
  "load-waterfall": drawLoadWaterfall,
  "local-search": drawLocalSearch,
  "support-shield": drawSupportShield,
  "benefit-marketing": drawBenefitMarketing,
  "benefit-saas": drawBenefitSaas,
  "benefit-design-system": drawBenefitDesignSystem,
  "benefit-api": drawBenefitApi,
  "commerce-conversion": drawCommerceConversion,
  "commerce-scale": drawCommerceScale,
  "commerce-secure": drawCommerceSecure,
  "commerce-platforms": drawCommercePlatforms,
  "illus-storefront": drawIllusStorefront,
  "illus-audit": drawIllusAudit,
  "illus-mobile-first": drawIllusMobileFirst,
  "illus-vitals": drawIllusVitals,
  "illus-mobile-checkout": drawIllusMobileCheckout,
  "illus-seo-growth": drawIllusSeoGrowth,
  "illus-handover": drawIllusHandover,
  "illus-app-services": drawIllusAppServices,
  "vs-frameworks": drawVsFrameworks,
  "pwa-install": drawPwaInstall,
  "ssr-smartedit": drawSsrSmartedit,
  "nextjs-architecture": drawNextjsArchitecture,
  "perf-by-design": drawPerfByDesign,
  "smart-shopping-list": drawSmartShoppingList,
  "wp-custom-theme": drawWpCustomTheme,
  "wp-stack-ownership": drawWpStackOwnership,
  "wp-flex-control": drawWpFlexControl,
};

export { isVariant } from "./names";
