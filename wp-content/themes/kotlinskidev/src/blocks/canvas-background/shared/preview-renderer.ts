import type { CanvasLayer, CanvasRecipe } from "../../../scripts/canvas-background/types";
import { layerRegistry } from "../../../scripts/canvas-background/registry";

const MAX_DPR = 2;
const FALLBACK_COLOR = "#000000";

export function createColorResolver(host: HTMLElement): (value: string) => string {
  const ownerDocument = host.ownerDocument;
  const ownerWindow = ownerDocument.defaultView ?? window;
  const colorCache = new Map<string, string>();

  const resolveThemeColor = (value: string): string => {
    const probe = ownerDocument.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.color = value;
    host.appendChild(probe);
    const resolved = ownerWindow.getComputedStyle(probe).color || FALLBACK_COLOR;
    host.removeChild(probe);
    return resolved;
  };

  return (value) => {
    if (!value) {
      return FALLBACK_COLOR;
    }
    const cached = colorCache.get(value);
    if (cached) {
      return cached;
    }
    const resolved = value.includes("var(") ? resolveThemeColor(value) : value;
    colorCache.set(value, resolved);
    return resolved;
  };
}

export interface PreviewRenderer {
  applySize: () => void;
  draw: (time: number) => void;
}

export function createPreviewRenderer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  getRecipe: () => CanvasRecipe
): PreviewRenderer {
  const host = canvas.parentElement ?? canvas;
  const ownerWindow = host.ownerDocument.defaultView ?? window;
  const resolveColor = createColorResolver(host);
  const layerCaches = new Map<number, Record<string, unknown>>();
  let width = 0;
  let drawHeight = 0;

  const applySize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(ownerWindow.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, Math.round(rect.width));
    drawHeight = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(drawHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawLayer = (layer: CanvasLayer, index: number, time: number): void => {
    const drawFn = layerRegistry[layer.type];
    if (!drawFn) {
      return;
    }
    const layerCache = layerCaches.get(index) ?? {};
    layerCaches.set(index, layerCache);
    drawFn(ctx, {
      width,
      height: drawHeight,
      time,
      params: layer.params,
      resolveColor,
      cache: layerCache,
    });
  };

  const draw = (time: number): void => {
    ctx.clearRect(0, 0, width, drawHeight);
    getRecipe().layers.forEach((layer, index) => drawLayer(layer, index, time));
  };

  return { applySize, draw };
}
