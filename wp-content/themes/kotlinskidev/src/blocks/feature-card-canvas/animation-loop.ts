import { easeInOutCubic, stepProgress } from "./easing";
import { readPalette, resolvePresetColor } from "./palette";
import type { FeatureCanvasVariant } from "./types";
import type { CanvasInstance } from "./canvas-instance";

const VARIANT_DURATION_MS: Partial<Record<FeatureCanvasVariant, number>> = {
  "speed-gauge": 1800,
  "site-scroll": 1600,
  "checkout-flow": 1800,
  "app-dashboard": 1800,
  "load-waterfall": 1600,
  "local-search": 1600,
  "support-shield": 1200,
  "benefit-marketing": 1600,
  "benefit-saas": 1800,
  "benefit-design-system": 1400,
  "benefit-api": 1600,
  "commerce-conversion": 1600,
  "commerce-scale": 1800,
  "commerce-secure": 1800,
  "commerce-platforms": 1600,
  "illus-storefront": 1800,
  "illus-audit": 1800,
  "illus-mobile-first": 1800,
  "illus-vitals": 2000,
  "illus-mobile-checkout": 2000,
  "illus-seo-growth": 1800,
  "illus-handover": 2000,
  "illus-app-services": 1800,
  "vs-frameworks": 1600,
  "pwa-install": 2000,
  "ssr-smartedit": 1900,
  "nextjs-architecture": 1900,
  "perf-by-design": 1900,
  "smart-shopping-list": 1900,
  "wp-custom-theme": 1900,
  "wp-stack-ownership": 1900,
  "wp-flex-control": 1900,
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const instances = new Set<CanvasInstance>();
let frameId: number | null = null;
let lastTimestamp = 0;
let classObserver: MutationObserver | null = null;
let visibilityBound = false;
let motionQuery: MediaQueryList | null = null;
let paletteRefreshFrame: number | null = null;

const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const needsLoop = (instance: CanvasInstance): boolean =>
  instance.visible && (instance.progress > 0 || instance.target > 0);

export const drawInstance = (instance: CanvasInstance): void => {
  if (instance.width <= 0 || instance.height <= 0) {
    return;
  }
  if (!instance.palette) {
    instance.palette = readPalette(
      (slug) => resolvePresetColor(instance.host, slug),
      instance.accent
    );
  }
  if (!instance.drawFn) {
    instance.ctx.clearRect(0, 0, instance.width, instance.height);
    return;
  }
  instance.drawFn({
    ctx: instance.ctx,
    width: instance.width,
    height: instance.height,
    time: instance.time,
    progress: easeInOutCubic(instance.progress),
    palette: instance.palette,
    labels: instance.labels,
  });
};

const stopLoop = (): void => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
};

const tick = (timestamp: number): void => {
  frameId = null;
  if (document.hidden) {
    return;
  }
  const dt = lastTimestamp ? timestamp - lastTimestamp : 0;
  lastTimestamp = timestamp;
  let keepRunning = false;
  instances.forEach((instance) => {
    if (!instance.visible) {
      return;
    }
    instance.progress = stepProgress(
      instance.progress,
      instance.target,
      dt,
      VARIANT_DURATION_MS[instance.variant]
    );
    instance.time = timestamp;
    drawInstance(instance);
    keepRunning = needsLoop(instance) || keepRunning;
  });
  if (keepRunning) {
    frameId = requestAnimationFrame(tick);
  } else {
    lastTimestamp = 0;
  }
};

export const ensureLoop = (): void => {
  if (frameId !== null || document.hidden || prefersReducedMotion()) {
    return;
  }
  let hasActiveInstance = false;
  instances.forEach((instance) => {
    hasActiveInstance = hasActiveInstance || needsLoop(instance);
  });
  if (hasActiveInstance) {
    lastTimestamp = 0;
    frameId = requestAnimationFrame(tick);
  }
};

const onVisibilityChange = (): void => {
  if (document.hidden) {
    stopLoop();
    lastTimestamp = 0;
  } else {
    ensureLoop();
  }
};

const onMotionPreferenceChange = (): void => {
  if (!prefersReducedMotion()) {
    ensureLoop();
    return;
  }
  stopLoop();
  lastTimestamp = 0;
  instances.forEach((instance) => {
    instance.progress = instance.target;
    if (instance.visible) {
      drawInstance(instance);
    }
  });
};

const invalidatePalettes = (): void => {
  instances.forEach((instance) => {
    instance.palette = null;
    if (instance.visible) {
      drawInstance(instance);
    }
  });
};

const schedulePaletteRefresh = (): void => {
  if (paletteRefreshFrame !== null) {
    return;
  }
  paletteRefreshFrame = requestAnimationFrame(() => {
    paletteRefreshFrame = null;
    invalidatePalettes();
  });
};

const onResourceLoad = (event: Event): void => {
  const target = event.target;
  if (target instanceof HTMLLinkElement && target.rel === "stylesheet") {
    schedulePaletteRefresh();
  }
};

const observeThemeClassChanges = (): void => {
  classObserver = new MutationObserver(invalidatePalettes);
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  if (document.body) {
    classObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  document.addEventListener("load", onResourceLoad, true);
  window.addEventListener("load", schedulePaletteRefresh);
};

const bindGlobals = (): void => {
  if (!visibilityBound) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    visibilityBound = true;
  }
  if (!motionQuery) {
    motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    motionQuery.addEventListener("change", onMotionPreferenceChange);
  }
  if (!classObserver) {
    observeThemeClassChanges();
  }
};

const unbindGlobals = (): void => {
  stopLoop();
  document.removeEventListener("visibilitychange", onVisibilityChange);
  visibilityBound = false;
  motionQuery?.removeEventListener("change", onMotionPreferenceChange);
  motionQuery = null;
  classObserver?.disconnect();
  classObserver = null;
  document.removeEventListener("load", onResourceLoad, true);
  window.removeEventListener("load", schedulePaletteRefresh);
};

export const registerInstance = (instance: CanvasInstance): void => {
  instances.add(instance);
  bindGlobals();
};

export const unregisterInstance = (instance: CanvasInstance): void => {
  instances.delete(instance);
  if (instances.size === 0) {
    unbindGlobals();
  }
};

export const applyTarget = (instance: CanvasInstance, target: number): void => {
  instance.target = Math.min(1, Math.max(0, target));
  if (prefersReducedMotion()) {
    instance.progress = instance.target;
    if (instance.visible) {
      drawInstance(instance);
    }
    return;
  }
  ensureLoop();
};
