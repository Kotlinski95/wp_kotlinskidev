import type { CanvasLayerDraw } from "../types";

interface GridLinesScratch {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

const getScratch = (
  cache: Record<string, unknown>,
  width: number,
  height: number
): CanvasRenderingContext2D | null => {
  const existing = cache.gridLines as GridLinesScratch | undefined;
  const scratch =
    existing && existing.width === width && existing.height === height
      ? existing
      : { canvas: document.createElement("canvas"), width, height };

  scratch.canvas.width = width;
  scratch.canvas.height = height;
  cache.gridLines = scratch;

  return scratch.canvas.getContext("2d");
};

const DEFAULT_OPACITY = 0.08;
const DEFAULT_LINE_COUNT = 12;
const MIN_LINE_COUNT = 2;
const LINE_WIDTH = 1;
const MASK_RADIUS_FACTOR = 0.8;
const MASK_MIDDLE_STOP = 0.6;
const MASK_STOPS = {
  opaque: "rgba(0,0,0,1)",
  faded: "rgba(0,0,0,0.4)",
  transparent: "rgba(0,0,0,0)",
};

interface GridGeometry {
  width: number;
  height: number;
  lineCount: number;
}

const strokeGridLines = (
  scratchCtx: CanvasRenderingContext2D,
  { width, height, lineCount }: GridGeometry
): void => {
  const stepX = width / lineCount;
  const stepY = height / lineCount;

  for (let i = 1; i < lineCount; i++) {
    const x = i * stepX;
    scratchCtx.beginPath();
    scratchCtx.moveTo(x, 0);
    scratchCtx.lineTo(x, height);
    scratchCtx.stroke();
  }

  for (let i = 1; i < lineCount; i++) {
    const y = i * stepY;
    scratchCtx.beginPath();
    scratchCtx.moveTo(0, y);
    scratchCtx.lineTo(width, y);
    scratchCtx.stroke();
  }
};

const fadeTowardsCorner = (
  scratchCtx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  const mask = scratchCtx.createRadialGradient(
    width,
    0,
    0,
    width,
    0,
    Math.hypot(width, height) * MASK_RADIUS_FACTOR
  );
  mask.addColorStop(0, MASK_STOPS.opaque);
  mask.addColorStop(MASK_MIDDLE_STOP, MASK_STOPS.faded);
  mask.addColorStop(1, MASK_STOPS.transparent);

  scratchCtx.globalCompositeOperation = "destination-in";
  scratchCtx.fillStyle = mask;
  scratchCtx.fillRect(0, 0, width, height);
  scratchCtx.globalCompositeOperation = "source-over";
};

const draw: CanvasLayerDraw = (ctx, { width, height, params, resolveColor, cache }) => {
  const opacity = Number(params.opacity ?? DEFAULT_OPACITY);
  if (opacity <= 0) {
    return;
  }

  const scratchCtx = getScratch(cache, width, height);
  if (!scratchCtx) {
    return;
  }

  const lineCount = Math.max(
    MIN_LINE_COUNT,
    Math.round(Number(params.lineCount ?? DEFAULT_LINE_COUNT))
  );
  const color = resolveColor(String(params.color ?? ""));

  scratchCtx.clearRect(0, 0, width, height);
  scratchCtx.strokeStyle = color;
  scratchCtx.lineWidth = LINE_WIDTH;

  strokeGridLines(scratchCtx, { width, height, lineCount });
  fadeTowardsCorner(scratchCtx, width, height);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(scratchCtx.canvas, 0, 0);
  ctx.restore();
};

export default draw;
