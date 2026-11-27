import {
  isAccessibilityMotionStopped,
  onAccessibilityMotionChange,
} from "@utils/accessibility-motion";
import type { CanvasRecipe } from "./types";
import type { Instance } from "./instance";
import { applySize, drawInstance } from "./instance-render";

const instances = new Map<HTMLElement, Instance>();
let rafId: number | null = null;
let domObserver: MutationObserver | null = null;
let motionListenerBound = false;

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

  if (anyActive && !isAccessibilityMotionStopped()) {
    rafId = requestAnimationFrame(tick);
  }
};

const ensureLoopRunning = (): void => {
  if (rafId === null && !isAccessibilityMotionStopped()) {
    rafId = requestAnimationFrame(tick);
  }
};

const stopLoop = (): void => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const handleMotionChange = (stopped: boolean): void => {
  if (stopped) {
    stopLoop();
    instances.forEach((instance) => drawInstance(instance, performance.now()));
    return;
  }
  const anyActive = Array.from(instances.values()).some((instance) => instance.active);
  if (anyActive) {
    ensureLoopRunning();
  }
};

const ensureMotionListener = (): void => {
  if (motionListenerBound) {
    return;
  }
  motionListenerBound = true;
  onAccessibilityMotionChange(handleMotionChange);
};

const cleanupDetachedInstances = (): void => {
  instances.forEach((instance, host) => {
    if (host.isConnected) {
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

const createCanvasWithContext = (
  host: HTMLElement
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null => {
  const canvas = host.ownerDocument.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    host.removeChild(canvas);
    return null;
  }
  return { canvas, ctx };
};

const onHostResized = (host: HTMLElement): void => {
  const current = instances.get(host);
  if (!current) {
    return;
  }
  applySize(current);
  drawInstance(current, performance.now());
};

const createInstance = (
  host: HTMLElement,
  surface: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
  recipe: CanvasRecipe,
  reducedMotion: boolean
): Instance => {
  const ownerWindow = host.ownerDocument.defaultView ?? window;
  return {
    host,
    canvas: surface.canvas,
    ctx: surface.ctx,
    recipe,
    active: false,
    reducedMotion,
    width: 0,
    height: 0,
    colorCache: new Map(),
    layerCaches: new Map(),
    resizeObserver: new ownerWindow.ResizeObserver(() => onHostResized(host)),
  };
};

export const mount = (host: HTMLElement, recipe: CanvasRecipe, reducedMotion: boolean): void => {
  if (instances.has(host)) {
    return;
  }

  const surface = createCanvasWithContext(host);
  if (!surface) {
    return;
  }

  const instance = createInstance(host, surface, recipe, reducedMotion);

  instances.set(host, instance);
  instance.resizeObserver.observe(host);
  applySize(instance);
  drawInstance(instance, 0);

  ensureDomObserver();
  ensureColorSchemeObserver();
  ensureMotionListener();

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
