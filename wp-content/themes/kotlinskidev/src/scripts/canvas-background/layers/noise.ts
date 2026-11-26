import type { CanvasLayerDraw } from "../types";

const TILE_SIZE = 96;
const DEFAULT_OPACITY = 0.06;
const DEFAULT_JITTER_AMOUNT = 1.0;
const GRAY_LEVELS = 255;
const OPAQUE_ALPHA = 255;
const JITTER_PIXELS = 40;
const JITTER_FREQUENCY_X = 0.00013;
const JITTER_FREQUENCY_Y = 0.00017;

interface NoiseCache {
  tile: HTMLCanvasElement;
  grainSize: number;
}

const buildTile = (grainSize: number): HTMLCanvasElement => {
  const tile = document.createElement("canvas");
  tile.width = TILE_SIZE;
  tile.height = TILE_SIZE;

  const tileCtx = tile.getContext("2d");
  if (!tileCtx) {
    return tile;
  }

  const imageData = tileCtx.createImageData(TILE_SIZE, TILE_SIZE);
  for (let y = 0; y < TILE_SIZE; y += grainSize) {
    for (let x = 0; x < TILE_SIZE; x += grainSize) {
      const value = Math.floor(Math.random() * GRAY_LEVELS);
      for (let gy = 0; gy < grainSize && y + gy < TILE_SIZE; gy++) {
        for (let gx = 0; gx < grainSize && x + gx < TILE_SIZE; gx++) {
          const index = ((y + gy) * TILE_SIZE + (x + gx)) * 4;
          imageData.data[index] = value;
          imageData.data[index + 1] = value;
          imageData.data[index + 2] = value;
          imageData.data[index + 3] = OPAQUE_ALPHA;
        }
      }
    }
  }
  tileCtx.putImageData(imageData, 0, 0);

  return tile;
};

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, cache }) => {
  const opacity = Number(params.opacity ?? DEFAULT_OPACITY);
  if (opacity <= 0) {
    return;
  }

  const grainSize = Math.max(1, Math.round(Number(params.grainSize ?? 1)));
  const existing = cache.noise as NoiseCache | undefined;
  const noiseCache: NoiseCache =
    existing && existing.grainSize === grainSize
      ? existing
      : { tile: buildTile(grainSize), grainSize };
  cache.noise = noiseCache;

  const pattern = ctx.createPattern(noiseCache.tile, "repeat");
  if (!pattern) {
    return;
  }

  const jitterAmount = Number(params.jitterAmount ?? DEFAULT_JITTER_AMOUNT);
  const offsetX = (Math.sin(time * JITTER_FREQUENCY_X) * jitterAmount * JITTER_PIXELS) % TILE_SIZE;
  const offsetY = (Math.cos(time * JITTER_FREQUENCY_Y) * jitterAmount * JITTER_PIXELS) % TILE_SIZE;

  const matrix = new DOMMatrix().translate(offsetX, offsetY);
  pattern.setTransform(matrix);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

export default draw;
