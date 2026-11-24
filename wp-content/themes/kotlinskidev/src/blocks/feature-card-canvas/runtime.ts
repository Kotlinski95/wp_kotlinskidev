import { DEFAULT_ACCENT_SLUG } from "./palette";
import { isVariant } from "./variants/names";
import { loadVariant } from "./variant-loaders";
import {
  applyTarget,
  drawInstance,
  ensureLoop,
  registerInstance,
  unregisterInstance,
} from "./animation-loop";
import { bindInputToInstance } from "./input-binding";
import type { CanvasInstance } from "./canvas-instance";
import type { FeatureCanvasTrigger, FeatureCanvasVariant } from "./types";

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

const MAX_DPR = 2;
const ACCENT_SLUG = /^[a-z0-9-]{1,64}$/;

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

const noopHandle: FeatureCanvasHandle = {
  setVisible: () => undefined,
  setTarget: () => undefined,
  destroy: () => undefined,
};

interface InstanceSource {
  host: HTMLElement;
  options: MountOptions;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  variant: FeatureCanvasVariant;
}

const createInstance = ({
  host,
  options,
  canvas,
  ctx,
  variant,
}: InstanceSource): CanvasInstance => ({
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
});

const loadDrawFunction = (instance: CanvasInstance): (() => void) => {
  let destroyed = false;
  void loadVariant(instance.variant).then((drawFn) => {
    if (!drawFn || destroyed) {
      return;
    }
    instance.drawFn = drawFn;
    if (instance.visible) {
      drawInstance(instance);
    }
    ensureLoop();
  });
  return () => {
    destroyed = true;
  };
};

const resizeInstanceCanvas = (instance: CanvasInstance, width: number, height: number): void => {
  const { canvas, ctx } = instance;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  instance.width = width;
  instance.height = height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (instance.visible) {
    drawInstance(instance);
  }
};

const observeHostSize = (instance: CanvasInstance): (() => void) => {
  if (typeof ResizeObserver === "undefined") {
    return () => undefined;
  }
  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) {
      return;
    }
    const { width, height } = entry.contentRect;
    if (width <= 0 || height <= 0) {
      return;
    }
    resizeInstanceCanvas(instance, width, height);
  });
  resizeObserver.observe(instance.host);
  return () => resizeObserver.disconnect();
};

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

  const instance = createInstance({ host, options, canvas, ctx, variant });
  registerInstance(instance);
  const cancelVariantLoad = loadDrawFunction(instance);

  const releaseInput = bindInputToInstance(instance, {
    host,
    touchAutoplay: options.touchAutoplay ?? host.dataset.touchAutoplay !== "false",
    trigger: (options.trigger ?? host.dataset.trigger) === "in-view" ? "in-view" : "hover",
  });
  const stopObservingSize = observeHostSize(instance);

  return {
    setVisible: (visible) => {
      instance.visible = visible;
      if (visible) {
        drawInstance(instance);
        ensureLoop();
      }
    },
    setTarget: (target) => applyTarget(instance, target),
    destroy: () => {
      cancelVariantLoad();
      releaseInput();
      stopObservingSize();
      unregisterInstance(instance);
    },
  };
};
