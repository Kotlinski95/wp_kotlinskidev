import type { CanvasLayerDraw } from "../types";

const DEFAULT_COUNT = 3;
const DEFAULT_SPEED = 0.3;
const DEFAULT_RADIUS_PERCENT = 25;
const TIME_SCALE = 0.0003;
const MINIMUM_EFFECTIVE_SPEED = 0.0001;
const ORBIT_SPREAD = 0.3;
const VERTICAL_FREQUENCY_RATIO = 1.3;
const TRANSPARENT_EDGE = "rgba(0,0,0,0)";

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor }) => {
  const count = Math.max(1, Math.round(Number(params.count ?? DEFAULT_COUNT)));
  const speed = Number(params.speed ?? DEFAULT_SPEED);
  const color = resolveColor(String(params.color ?? ""));
  const radiusPct = Number(params.radiusPct ?? DEFAULT_RADIUS_PERCENT);
  const radius = (Math.min(width, height) * radiusPct) / 100;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < count; i++) {
    const phase = (i / count) * Math.PI * 2;
    const tOffset = time * TIME_SCALE * (speed || MINIMUM_EFFECTIVE_SPEED) + phase;
    const x = width / 2 + Math.cos(tOffset) * width * ORBIT_SPREAD;
    const y = height / 2 + Math.sin(tOffset * VERTICAL_FREQUENCY_RATIO) * height * ORBIT_SPREAD;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, TRANSPARENT_EDGE);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export default draw;
