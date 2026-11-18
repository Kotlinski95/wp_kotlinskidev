import { clamp01, staggerProgress } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const SERVERS = 4;
const POINTS = 28;
const REST_FRACTION = 0.12;
const TARGET_FRACTION = 0.98;

export const drawCommerceScale = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const chart = { x: area.x, y: area.y, w: area.w * 0.58, h: area.h * 0.62 };
  const floor = chart.y + chart.h;
  const wobble = progress > 0 ? 1 : 0;

  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.beginPath();
  ctx.moveTo(chart.x, chart.y);
  ctx.lineTo(chart.x, floor);
  ctx.lineTo(chart.x + chart.w, floor);
  ctx.stroke();

  const curve: Array<readonly [number, number]> = [];
  for (let index = 0; index <= POINTS * progress; index += 1) {
    const u = Math.min(progress, index / POINTS);
    const level = 0.08 + 0.82 * u ** 2.2 + Math.sin(time / 380 + u * 9) * 0.02 * wobble * u;
    curve.push([chart.x + u * chart.w, floor - level * chart.h]);
  }
  if (curve.length > 1) {
    ctx.beginPath();
    curve.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(curve[curve.length - 1][0], floor);
    ctx.lineTo(chart.x, floor);
    ctx.closePath();
    ctx.fillStyle = rgba(palette.accent, 0.12);
    ctx.fill();
    ctx.beginPath();
    curve.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.strokeStyle = tint(palette, progress);
    ctx.stroke();
  }
  const latency = floor - chart.h * (0.14 + Math.sin(time / 500) * 0.012 * wobble);
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.strong, 0.55);
  ctx.beginPath();
  ctx.moveTo(chart.x, latency);
  ctx.lineTo(chart.x + chart.w, latency);
  ctx.stroke();
  ctx.setLineDash([]);

  const blockW = area.w * 0.3;
  const blockH = area.h * 0.13;
  for (let index = 0; index < SERVERS; index += 1) {
    const local = staggerProgress(progress, index, SERVERS, 0.6);
    const rect = {
      x: area.x + area.w * 0.7 + (1 - local) * blockW * 0.12,
      y: area.y + index * (blockH + area.h * 0.04),
      w: blockW,
      h: blockH,
    };
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.5 * local;
    fillRounded(ctx, rect, 4, rgba(palette.surface, 1));
    roundedRectPath(ctx, rect, 4);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, local, 0.9);
    ctx.stroke();
    pill(ctx, rect.x + rect.w * 0.12, rect.y + rect.h * 0.38, rect.w * 0.45, rect.h * 0.24, soft);
    dot(ctx, rect.x + rect.w * 0.82, rect.y + rect.h / 2, rect.h * 0.16, tint(palette, local));
    ctx.restore();
  }

  const fraction = REST_FRACTION + (TARGET_FRACTION - REST_FRACTION) * clamp01(progress);
  const radius = area.h * 0.14;
  const rx = area.x + radius + area.w * 0.04;
  const ry = area.y + area.h - radius;
  ctx.lineCap = "round";
  ctx.lineWidth = radius * 0.18;
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.beginPath();
  ctx.arc(rx, ry, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.arc(rx, ry, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  ctx.stroke();
  ctx.font = `bold ${Math.round(radius * 0.8)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = tint(palette, progress);
  ctx.fillText(String(Math.round(fraction * 100)), rx, ry + 1);
  pill(ctx, rx + radius * 1.5, ry - radius * 0.4, area.w * 0.3, area.h * 0.05, soft);
  pill(ctx, rx + radius * 1.5, ry + radius * 0.3, area.w * 0.2, area.h * 0.05, soft);
};
