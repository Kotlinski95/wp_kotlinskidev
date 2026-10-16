import type { CanvasLayer, CanvasRecipe } from "./types";
import { layerRegistry } from "./registry";

interface Instance {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  recipe: CanvasRecipe;
  active: boolean;
  reducedMotion: boolean;
  width: number;
  height: number;
  colorCache: Map<string, string>;
  layerCaches: Map<CanvasLayer, Record<string, unknown>>;
  resizeObserver: ResizeObserver;
}

const MAX_DPR = 2;
const instances = new Map<HTMLElement, Instance>();
let rafId: number | null = null;
let domObserver: MutationObserver | null = null;

const resolveColorValue = (host: HTMLElement, rawValue: string): string => {
  if (!rawValue) {
    return "#000000";
  }
  if (!rawValue.includes("var(")) {
    return rawValue;
  }

  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.color = rawValue;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  host.removeChild(probe);

  return resolved || "#000000";
};

const makeResolveColor = (instance: Instance): ((value: string) => string) => {
  return (value: string) => {
    const cached = instance.colorCache.get(value);
    if (cached) {
      return cached;
    }
    const resolved = resolveColorValue(instance.host, value);
    instance.colorCache.set(value, resolved);
    return resolved;
  };
};

const applySize = (instance: Instance): void => {
  const rect = instance.host.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  instance.canvas.width = Math.round(width * dpr);
  instance.canvas.height = Math.round(height * dpr);
  instance.canvas.style.width = `${width}px`;
  instance.canvas.style.height = `${height}px`;
  instance.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  instance.width = width;
  instance.height = height;
};

const drawInstance = (instance: Instance, time: number): void => {
  const { ctx, width, height, recipe } = instance;
  const resolveColor = makeResolveColor(instance);

  ctx.clearRect(0, 0, width, height);

  for (const layer of recipe.layers) {
    const drawFn = layerRegistry[layer.type];
    if (!drawFn) {
      continue;
    }

    const layerCache = instance.layerCaches.get(layer) ?? {};
    instance.layerCaches.set(layer, layerCache);

    drawFn(ctx, {
      width,
      height,
      time,
      params: layer.params,
      resolveColor,
      cache: layerCache,
    });
  }
};

const tick = (time: number): void => {
  rafId = null;
  let anyActive = false;

  instances.forEach((instance) => {
    if (!instance.active) {
      return;
    }
    anyActive = true;
    drawInstance(instance, time);
  });

  if (anyActive) {
    rafId = requestAnimationFrame(tick);
  }
};

const ensureLoopRunning = (): void => {
  if (rafId === null) {
    rafId = requestAnimationFrame(tick);
  }
};

const cleanupDetachedInstances = (): void => {
  instances.forEach((instance, host) => {
    if (document.contains(host)) {
      return;
    }
    instance.resizeObserver.disconnect();
    instances.delete(host);
  });
};

const ensureDomObserver = (): void => {
  if (domObserver) {
    return;
  }
  domObserver = new MutationObserver(() => cleanupDetachedInstances());
  domObserver.observe(document.body, { childList: true, subtree: true });
};

const handleColorSchemeChange = (): void => {
  instances.forEach((instance) => {
    instance.colorCache.clear();
    if (!instance.active) {
      drawInstance(instance, performance.now());
    }
  });
};

const ensureColorSchemeObserver = ((): (() => void) => {
  let observer: MutationObserver | null = null;
  return () => {
    if (observer) {
      return;
    }
    observer = new MutationObserver(handleColorSchemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  };
})();

export const mount = (host: HTMLElement, recipe: CanvasRecipe, reducedMotion: boolean): void => {
  if (instances.has(host)) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    host.removeChild(canvas);
    return;
  }

  const instance: Instance = {
    host,
    canvas,
    ctx,
    recipe,
    active: false,
    reducedMotion,
    width: 0,
    height: 0,
    colorCache: new Map(),
    layerCaches: new Map(),
    resizeObserver: new ResizeObserver(() => {
      const current = instances.get(host);
      if (!current) {
        return;
      }
      applySize(current);
      drawInstance(current, performance.now());
    }),
  };

  instances.set(host, instance);
  instance.resizeObserver.observe(host);
  applySize(instance);
  drawInstance(instance, 0);

  ensureDomObserver();
  ensureColorSchemeObserver();

  if (!reducedMotion) {
    instance.active = true;
    ensureLoopRunning();
  }
};

export const setActive = (host: HTMLElement, active: boolean): void => {
  const instance = instances.get(host);
  if (!instance || instance.reducedMotion) {
    return;
  }

  instance.active = active;
  if (active) {
    ensureLoopRunning();
  }
};
