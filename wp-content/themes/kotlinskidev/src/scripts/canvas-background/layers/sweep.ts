import type { CanvasLayerDraw } from "../types";

const DEFAULT_SPEED = 0.15;
const DEFAULT_ANGLE_DEGREES = 25;
const DEFAULT_WIDTH = 0.15;
const MIN_BAND_HALF_WIDTH = 0.01;
const MAX_BAND_HALF_WIDTH = 0.49;
const TIME_SCALE = 0.0002;
const SWEEP_START_OFFSET = 0.5;
const SWEEP_ALPHA = 0.6;
const TRANSPARENT_EDGE = "rgba(0,0,0,0)";

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor }) => {
  const speed = Number(params.speed ?? DEFAULT_SPEED);
  if (speed <= 0) {
    return;
  }

  const angle = (Number(params.angleDeg ?? DEFAULT_ANGLE_DEGREES) * Math.PI) / 180;
  const bandWidth = Math.min(
    MAX_BAND_HALF_WIDTH,
    Math.max(MIN_BAND_HALF_WIDTH, Number(params.width ?? DEFAULT_WIDTH) / 2)
  );
  const color = resolveColor(String(params.color ?? "#ffffff"));
  const diagonal = Math.hypot(width, height);

  const progress = (time * TIME_SCALE * speed) % 1;
  const sweepOffset = (progress * 2 - SWEEP_START_OFFSET) * diagonal;

  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const centerX = width / 2 + dx * sweepOffset;
  const centerY = height / 2 + dy * sweepOffset;

  const gradient = ctx.createLinearGradient(
    centerX - dx * diagonal,
    centerY - dy * diagonal,
    centerX + dx * diagonal,
    centerY + dy * diagonal
  );
  gradient.addColorStop(Math.max(0, 0.5 - bandWidth), TRANSPARENT_EDGE);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(Math.min(1, 0.5 + bandWidth), TRANSPARENT_EDGE);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = SWEEP_ALPHA;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

export default draw;
