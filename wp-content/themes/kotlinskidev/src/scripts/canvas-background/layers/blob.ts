import type { CanvasLayerDraw } from "../types";

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor }) => {
  const count = Math.max(1, Math.round(Number(params.count ?? 3)));
  const speed = Number(params.speed ?? 0.3);
  const color = resolveColor(String(params.color ?? ""));
  const radiusPct = Number(params.radiusPct ?? 25);
  const radius = (Math.min(width, height) * radiusPct) / 100;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < count; i++) {
    const phase = (i / count) * Math.PI * 2;
    const tOffset = time * 0.0003 * (speed || 0.0001) + phase;
    const x = width / 2 + Math.cos(tOffset) * width * 0.3;
    const y = height / 2 + Math.sin(tOffset * 1.3) * height * 0.3;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export default draw;
