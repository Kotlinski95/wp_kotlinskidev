import type { CanvasLayerDraw } from "../types";

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor }) => {
  const speed = Number(params.speed ?? 0.15);
  if (speed <= 0) {
    return;
  }

  const angle = (Number(params.angleDeg ?? 25) * Math.PI) / 180;
  const bandWidth = Math.min(0.49, Math.max(0.01, Number(params.width ?? 0.15) / 2));
  const color = resolveColor(String(params.color ?? "#ffffff"));
  const diagonal = Math.hypot(width, height);

  const progress = (time * 0.0002 * speed) % 1;
  const sweepOffset = (progress * 2 - 0.5) * diagonal;

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
  gradient.addColorStop(Math.max(0, 0.5 - bandWidth), "rgba(0,0,0,0)");
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(Math.min(1, 0.5 + bandWidth), "rgba(0,0,0,0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

export default draw;
