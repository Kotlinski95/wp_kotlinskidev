import type { DrawContext, FeatureCanvasVariant } from "./types";

export type DrawFunction = (dc: DrawContext) => void;

const variantLoaders: Record<FeatureCanvasVariant, () => Promise<DrawFunction>> = {
  "browser-stream": () =>
    import(/* webpackChunkName: "fcc-variant-browser-stream" */ "./variants/browser-stream").then(
      (module) => module.drawBrowserStream
    ),
  "node-tree": () =>
    import(/* webpackChunkName: "fcc-variant-node-tree" */ "./variants/node-tree").then(
      (module) => module.drawNodeTree
    ),
  "dot-image-stack": () =>
    import(/* webpackChunkName: "fcc-variant-dot-image-stack" */ "./variants/dot-image-stack").then(
      (module) => module.drawDotImageStack
    ),
  "chart-growth": () =>
    import(/* webpackChunkName: "fcc-variant-chart-growth" */ "./variants/chart-growth").then(
      (module) => module.drawChartGrowth
    ),
  storefront: () =>
    import(/* webpackChunkName: "fcc-variant-storefront" */ "./variants/storefront").then(
      (module) => module.drawStorefront
    ),
  "layout-builder": () =>
    import(/* webpackChunkName: "fcc-variant-layout-builder" */ "./variants/layout-builder").then(
      (module) => module.drawLayoutBuilder
    ),
  "speed-gauge": () =>
    import(/* webpackChunkName: "fcc-variant-speed-gauge" */ "./variants/speed-gauge").then(
      (module) => module.drawSpeedGauge
    ),
  "nav-about": () =>
    import(/* webpackChunkName: "fcc-variant-nav-about" */ "./variants/nav-about").then(
      (module) => module.drawNavAbout
    ),
  "nav-projects": () =>
    import(/* webpackChunkName: "fcc-variant-nav-projects" */ "./variants/nav-projects").then(
      (module) => module.drawNavProjects
    ),
  "nav-services": () =>
    import(/* webpackChunkName: "fcc-variant-nav-services" */ "./variants/nav-services").then(
      (module) => module.drawNavServices
    ),
  "nav-contact": () =>
    import(/* webpackChunkName: "fcc-variant-nav-contact" */ "./variants/nav-contact").then(
      (module) => module.drawNavContact
    ),
  "site-scroll": () =>
    import(/* webpackChunkName: "fcc-variant-site-scroll" */ "./variants/site-scroll").then(
      (module) => module.drawSiteScroll
    ),
  "checkout-flow": () =>
    import(/* webpackChunkName: "fcc-variant-checkout-flow" */ "./variants/checkout-flow").then(
      (module) => module.drawCheckoutFlow
    ),
  "app-dashboard": () =>
    import(/* webpackChunkName: "fcc-variant-app-dashboard" */ "./variants/app-dashboard").then(
      (module) => module.drawAppDashboard
    ),
  "load-waterfall": () =>
    import(/* webpackChunkName: "fcc-variant-load-waterfall" */ "./variants/load-waterfall").then(
      (module) => module.drawLoadWaterfall
    ),
  "local-search": () =>
    import(/* webpackChunkName: "fcc-variant-local-search" */ "./variants/local-search").then(
      (module) => module.drawLocalSearch
    ),
  "support-shield": () =>
    import(/* webpackChunkName: "fcc-variant-support-shield" */ "./variants/support-shield").then(
      (module) => module.drawSupportShield
    ),
  "benefit-marketing": () =>
    import(
      /* webpackChunkName: "fcc-variant-benefit-marketing" */ "./variants/benefit-marketing"
    ).then((module) => module.drawBenefitMarketing),
  "benefit-saas": () =>
    import(/* webpackChunkName: "fcc-variant-benefit-saas" */ "./variants/benefit-saas").then(
      (module) => module.drawBenefitSaas
    ),
  "benefit-design-system": () =>
    import(
      /* webpackChunkName: "fcc-variant-benefit-design-system" */ "./variants/benefit-design-system"
    ).then((module) => module.drawBenefitDesignSystem),
  "benefit-api": () =>
    import(/* webpackChunkName: "fcc-variant-benefit-api" */ "./variants/benefit-api").then(
      (module) => module.drawBenefitApi
    ),
  "commerce-conversion": () =>
    import(
      /* webpackChunkName: "fcc-variant-commerce-conversion" */ "./variants/commerce-conversion"
    ).then((module) => module.drawCommerceConversion),
  "commerce-scale": () =>
    import(/* webpackChunkName: "fcc-variant-commerce-scale" */ "./variants/commerce-scale").then(
      (module) => module.drawCommerceScale
    ),
  "commerce-secure": () =>
    import(/* webpackChunkName: "fcc-variant-commerce-secure" */ "./variants/commerce-secure").then(
      (module) => module.drawCommerceSecure
    ),
  "commerce-platforms": () =>
    import(
      /* webpackChunkName: "fcc-variant-commerce-platforms" */ "./variants/commerce-platforms"
    ).then((module) => module.drawCommercePlatforms),
  "illus-storefront": () =>
    import(
      /* webpackChunkName: "fcc-variant-illus-storefront" */ "./variants/illus-storefront"
    ).then((module) => module.drawIllusStorefront),
  "illus-audit": () =>
    import(/* webpackChunkName: "fcc-variant-illus-audit" */ "./variants/illus-audit").then(
      (module) => module.drawIllusAudit
    ),
  "illus-mobile-first": () =>
    import(
      /* webpackChunkName: "fcc-variant-illus-mobile-first" */ "./variants/illus-mobile-first"
    ).then((module) => module.drawIllusMobileFirst),
  "illus-vitals": () =>
    import(/* webpackChunkName: "fcc-variant-illus-vitals" */ "./variants/illus-vitals").then(
      (module) => module.drawIllusVitals
    ),
  "illus-mobile-checkout": () =>
    import(
      /* webpackChunkName: "fcc-variant-illus-mobile-checkout" */ "./variants/illus-mobile-checkout"
    ).then((module) => module.drawIllusMobileCheckout),
  "illus-seo-growth": () =>
    import(
      /* webpackChunkName: "fcc-variant-illus-seo-growth" */ "./variants/illus-seo-growth"
    ).then((module) => module.drawIllusSeoGrowth),
  "illus-handover": () =>
    import(/* webpackChunkName: "fcc-variant-illus-handover" */ "./variants/illus-handover").then(
      (module) => module.drawIllusHandover
    ),
  "illus-app-services": () =>
    import(
      /* webpackChunkName: "fcc-variant-illus-app-services" */ "./variants/illus-app-services"
    ).then((module) => module.drawIllusAppServices),
  "vs-frameworks": () =>
    import(/* webpackChunkName: "fcc-variant-vs-frameworks" */ "./variants/vs-frameworks").then(
      (module) => module.drawVsFrameworks
    ),
  "pwa-install": () =>
    import(/* webpackChunkName: "fcc-variant-pwa-install" */ "./variants/pwa-install").then(
      (module) => module.drawPwaInstall
    ),
  "ssr-smartedit": () =>
    import(/* webpackChunkName: "fcc-variant-ssr-smartedit" */ "./variants/ssr-smartedit").then(
      (module) => module.drawSsrSmartedit
    ),
  "nextjs-architecture": () =>
    import(
      /* webpackChunkName: "fcc-variant-nextjs-architecture" */ "./variants/nextjs-architecture"
    ).then((module) => module.drawNextjsArchitecture),
  "perf-by-design": () =>
    import(/* webpackChunkName: "fcc-variant-perf-by-design" */ "./variants/perf-by-design").then(
      (module) => module.drawPerfByDesign
    ),
  "smart-shopping-list": () =>
    import(
      /* webpackChunkName: "fcc-variant-smart-shopping-list" */ "./variants/smart-shopping-list"
    ).then((module) => module.drawSmartShoppingList),
  "wp-custom-theme": () =>
    import(/* webpackChunkName: "fcc-variant-wp-custom-theme" */ "./variants/wp-custom-theme").then(
      (module) => module.drawWpCustomTheme
    ),
  "wp-stack-ownership": () =>
    import(
      /* webpackChunkName: "fcc-variant-wp-stack-ownership" */ "./variants/wp-stack-ownership"
    ).then((module) => module.drawWpStackOwnership),
  "wp-flex-control": () =>
    import(/* webpackChunkName: "fcc-variant-wp-flex-control" */ "./variants/wp-flex-control").then(
      (module) => module.drawWpFlexControl
    ),
};

const loaded = new Map<FeatureCanvasVariant, DrawFunction>();
const pending = new Map<FeatureCanvasVariant, Promise<DrawFunction | null>>();

const attempt = async (
  variant: FeatureCanvasVariant,
  retries: number
): Promise<DrawFunction | null> => {
  try {
    return await variantLoaders[variant]();
  } catch {
    return retries > 0 ? attempt(variant, retries - 1) : null;
  }
};

export const loadVariant = (variant: FeatureCanvasVariant): Promise<DrawFunction | null> => {
  const cached = loaded.get(variant);
  if (cached) {
    return Promise.resolve(cached);
  }
  const inflight = pending.get(variant);
  if (inflight) {
    return inflight;
  }
  const request = attempt(variant, 1).then((drawFn) => {
    pending.delete(variant);
    if (drawFn) {
      loaded.set(variant, drawFn);
    }
    return drawFn;
  });
  pending.set(variant, request);
  return request;
};
