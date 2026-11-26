export type FeatureCanvasTrigger = "hover" | "in-view";

export type FeatureCanvasVariant =
  | "browser-stream"
  | "node-tree"
  | "dot-image-stack"
  | "chart-growth"
  | "storefront"
  | "layout-builder"
  | "speed-gauge"
  | "nav-about"
  | "nav-projects"
  | "nav-services"
  | "nav-contact"
  | "site-scroll"
  | "checkout-flow"
  | "app-dashboard"
  | "load-waterfall"
  | "local-search"
  | "support-shield"
  | "benefit-marketing"
  | "benefit-saas"
  | "benefit-design-system"
  | "benefit-api"
  | "commerce-conversion"
  | "commerce-scale"
  | "commerce-secure"
  | "commerce-platforms"
  | "illus-storefront"
  | "illus-audit"
  | "illus-mobile-first"
  | "illus-vitals"
  | "illus-mobile-checkout"
  | "illus-seo-growth"
  | "illus-handover"
  | "illus-app-services"
  | "vs-frameworks"
  | "pwa-install"
  | "ssr-smartedit"
  | "nextjs-architecture"
  | "perf-by-design"
  | "smart-shopping-list"
  | "wp-custom-theme"
  | "wp-stack-ownership"
  | "wp-flex-control";

export type Rgb = readonly [number, number, number];

export interface FeatureCanvasPalette {
  accent: Rgb;
  accentGlow: Rgb;
  line: Rgb;
  muted: Rgb;
  strong: Rgb;
  surface: Rgb;
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  progress: number;
  palette: FeatureCanvasPalette;
  labels: readonly string[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
