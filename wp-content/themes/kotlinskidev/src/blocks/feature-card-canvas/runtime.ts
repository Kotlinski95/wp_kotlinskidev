import { easeInOutCubic, stepProgress } from "./easing";
import { DEFAULT_ACCENT_SLUG, readPalette, resolvePresetColor } from "./palette";
import { isVariant } from "./variants/names";
import { loadVariant, type DrawFunction } from "./variant-loaders";
import type { FeatureCanvasPalette, FeatureCanvasTrigger, FeatureCanvasVariant } from "./types";

export interface MountOptions {
  labels?: readonly string[];
  variant?: FeatureCanvasVariant;
  accent?: string;
  touchAutoplay?: boolean;
  trigger?: FeatureCanvasTrigger;
}

export interface FeatureCanvasHandle {
  setVisible: (visible: boolean) => void;
  setTarget: (target: number) => void;
  destroy: () => void;
}

interface Instance {
  host: HTMLElement;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  variant: FeatureCanvasVariant;
  labels: readonly string[];
  accent: string;
  width: number;
  height: number;
  progress: number;
  target: number;
  visible: boolean;
  palette: FeatureCanvasPalette | null;
  time: number;
  drawFn: DrawFunction | null;
}

const MAX_DPR = 2;
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
const instances = new Set<Instance>();
let frameId: number | null = null;
let lastTimestamp = 0;
let classObserver: MutationObserver | null = null;
let visibilityBound = false;
let motionQuery: MediaQueryList | null = null;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const HOVER_NONE_QUERY = "(hover: none)";
const ACCENT_SLUG = /^[a-z0-9-]{1,64}$/;
const CENTRE_BAND_MARGIN = "-35% 0px -35% 0px";
const CENTRE_BAND_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

const resolveAccent = (raw: string | undefined): string =>
  raw && ACCENT_SLUG.test(raw) ? raw : DEFAULT_ACCENT_SLUG;

const parseLabels = (raw: string | undefined): readonly string[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const needsLoop = (instance: Instance): boolean =>
  instance.visible && (instance.progress > 0 || instance.target > 0);

const draw = (instance: Instance): void => {
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
    draw(instance);
    keepRunning = keepRunning || needsLoop(instance);
  });
  if (keepRunning) {
    frameId = requestAnimationFrame(tick);
  } else {
    lastTimestamp = 0;
  }
};

const ensureLoop = (): void => {
  if (frameId !== null || document.hidden || prefersReducedMotion()) {
    return;
  }
  let any = false;
  instances.forEach((instance) => {
    any = any || needsLoop(instance);
  });
  if (any) {
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
      draw(instance);
    }
  });
};

const invalidatePalettes = (): void => {
  instances.forEach((instance) => {
    instance.palette = null;
    if (instance.visible) {
      draw(instance);
    }
  });
};

let paletteRefreshFrame: number | null = null;

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

const applyTarget = (instance: Instance, target: number): void => {
  instance.target = Math.min(1, Math.max(0, target));
  if (prefersReducedMotion()) {
    instance.progress = instance.target;
    if (instance.visible) {
      draw(instance);
    }
    return;
  }
  ensureLoop();
};

const noopHandle: FeatureCanvasHandle = {
  setVisible: () => undefined,
  setTarget: () => undefined,
  destroy: () => undefined,
};

const IN_VIEW_THRESHOLD = 0.4;

export const mountFeatureCanvas = (
  host: HTMLElement,
  options: MountOptions = {}
): FeatureCanvasHandle => {
  const canvas = host.querySelector("canvas");
  const ctx = canvas?.getContext("2d");
  const variant = options.variant ?? host.dataset.variant;
  if (!canvas || !ctx || !isVariant(variant)) {
    return noopHandle;
  }

  const instance: Instance = {
    host,
    canvas,
    ctx,
    variant,
    labels: options.labels ?? parseLabels(host.dataset.labels),
    accent: resolveAccent(options.accent ?? host.dataset.accent),
    width: 0,
    height: 0,
    progress: 0,
    target: 0,
    visible: true,
    palette: null,
    time: 0,
    drawFn: null,
  };
  instances.add(instance);
  bindGlobals();
  let destroyed = false;
  void loadVariant(variant).then((drawFn) => {
    if (!drawFn || destroyed) {
      return;
    }
    instance.drawFn = drawFn;
    if (instance.visible) {
      draw(instance);
    }
    ensureLoop();
  });

  const hoverTarget: Element =
    host.closest(".kt-feature-card") ?? host.closest(".wp-block-group") ?? host;
  const touchAutoplay = options.touchAutoplay ?? host.dataset.touchAutoplay !== "false";
  const trigger: FeatureCanvasTrigger =
    (options.trigger ?? host.dataset.trigger) === "in-view" ? "in-view" : "hover";
  const cleanups: Array<() => void> = [];
  let inputCleanups: Array<() => void> = [];

  const listen = (element: Element, type: string, handler: EventListener): void => {
    element.addEventListener(type, handler);
    inputCleanups.push(() => element.removeEventListener(type, handler));
  };

  const releaseInput = (): void => {
    inputCleanups.forEach((cleanup) => cleanup());
    inputCleanups = [];
  };

  const bindInput = (touchOnly: boolean): void => {
    releaseInput();
    applyTarget(instance, 0);
    if (trigger === "in-view") {
      if (typeof IntersectionObserver === "undefined") {
        applyTarget(instance, 1);
        return;
      }
      const viewObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              applyTarget(instance, 1);
              return;
            }
            instance.progress = 0;
            instance.target = 0;
          });
        },
        { threshold: IN_VIEW_THRESHOLD }
      );
      viewObserver.observe(host);
      inputCleanups.push(() => viewObserver.disconnect());
      return;
    }
    if (!touchOnly) {
      listen(hoverTarget, "mouseenter", () => applyTarget(instance, 1));
      listen(hoverTarget, "mouseleave", () => applyTarget(instance, 0));
      listen(hoverTarget, "focusin", () => applyTarget(instance, 1));
      listen(hoverTarget, "focusout", () => applyTarget(instance, 0));
      return;
    }
    if (!touchAutoplay || typeof IntersectionObserver === "undefined") {
      return;
    }
    const centreObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => applyTarget(instance, entry.isIntersecting ? 1 : 0));
      },
      { rootMargin: CENTRE_BAND_MARGIN, threshold: CENTRE_BAND_THRESHOLDS }
    );
    centreObserver.observe(hoverTarget);
    inputCleanups.push(() => centreObserver.disconnect());
  };

  const hoverQuery = window.matchMedia(HOVER_NONE_QUERY);
  bindInput(hoverQuery.matches);
  const onHoverQueryChange = (event: MediaQueryListEvent): void => bindInput(event.matches);
  hoverQuery.addEventListener?.("change", onHoverQueryChange);
  cleanups.push(() => {
    hoverQuery.removeEventListener?.("change", onHoverQueryChange);
    releaseInput();
  });

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      instance.width = width;
      instance.height = height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (instance.visible) {
        draw(instance);
      }
    });
    resizeObserver.observe(host);
    cleanups.push(() => resizeObserver.disconnect());
  }

  return {
    setVisible: (visible) => {
      instance.visible = visible;
      if (visible) {
        draw(instance);
        ensureLoop();
      }
    },
    setTarget: (target) => applyTarget(instance, target),
    destroy: () => {
      destroyed = true;
      cleanups.forEach((cleanup) => cleanup());
      instances.delete(instance);
      if (instances.size === 0) {
        unbindGlobals();
      }
    },
  };
};
