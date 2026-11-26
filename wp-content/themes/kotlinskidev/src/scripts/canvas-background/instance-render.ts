import type { Instance } from "./instance";
import { layerRegistry } from "./registry";
import { makeResolveColor } from "./instance-color";

const MAX_DPR = 2;

export const applySize = (instance: Instance): void => {
  const rect = instance.host.getBoundingClientRect();
  const ownerWindow = instance.host.ownerDocument.defaultView ?? window;
  const dpr = Math.min(ownerWindow.devicePixelRatio || 1, MAX_DPR);
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

export const drawInstance = (instance: Instance, time: number): void => {
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
