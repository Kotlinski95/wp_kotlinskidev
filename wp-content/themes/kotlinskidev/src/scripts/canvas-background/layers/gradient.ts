import type { CanvasLayerDraw } from "../types";

const DEFAULT_SPEED = 0.2;
const DEFAULT_ANGLE_DEGREES = 135;
const ROTATION_DEGREES_PER_MS_AT_UNIT_SPEED = 0.002;

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor }) => {
  const speed = Number(params.speed ?? DEFAULT_SPEED);
  const baseAngle = Number(params.angleDeg ?? DEFAULT_ANGLE_DEGREES);
  const angle =
    ((baseAngle + time * ROTATION_DEGREES_PER_MS_AT_UNIT_SPEED * speed) * Math.PI) / 180;
  const colorStart = resolveColor(String(params.colorStart ?? ""));
  const colorEnd = resolveColor(String(params.colorEnd ?? ""));

  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const diagonal = Math.hypot(width, height);
  const centerX = width / 2;
  const centerY = height / 2;

  const gradient = ctx.createLinearGradient(
    centerX - (dx * diagonal) / 2,
    centerY - (dy * diagonal) / 2,
    centerX + (dx * diagonal) / 2,
    centerY + (dy * diagonal) / 2
  );
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

export default draw;
