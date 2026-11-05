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

const draw: CanvasLayerDraw = (ctx, { width, height, params, resolveColor, cache }) => {
  const opacity = Number(params.opacity ?? 0.08);
  if (opacity <= 0) {
    return;
  }

  const scratchCtx = getScratch(cache, width, height);
  if (!scratchCtx) {
    return;
  }

  const lineCount = Math.max(2, Math.round(Number(params.lineCount ?? 12)));
  const color = resolveColor(String(params.color ?? ""));
  const stepX = width / lineCount;
  const stepY = height / lineCount;

  scratchCtx.clearRect(0, 0, width, height);
  scratchCtx.strokeStyle = color;
  scratchCtx.lineWidth = 1;

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

  const mask = scratchCtx.createRadialGradient(
    width,
    0,
    0,
    width,
    0,
    Math.hypot(width, height) * 0.8
  );
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(0.6, "rgba(0,0,0,0.4)");
  mask.addColorStop(1, "rgba(0,0,0,0)");

  scratchCtx.globalCompositeOperation = "destination-in";
  scratchCtx.fillStyle = mask;
  scratchCtx.fillRect(0, 0, width, height);
  scratchCtx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(scratchCtx.canvas, 0, 0);
  ctx.restore();
};

export default draw;
