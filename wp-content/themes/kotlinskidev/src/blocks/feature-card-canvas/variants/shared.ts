import { clamp01 } from "../easing";
import { mixRgb, rgba } from "../palette";
import type { FeatureCanvasPalette, Rect } from "../types";

export const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  radius: number
): void => {
  const r = Math.max(0, Math.min(radius, rect.w / 2, rect.h / 2));
  ctx.beginPath();
  ctx.moveTo(rect.x + r, rect.y);
  ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h, r);
  ctx.arcTo(rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h, r);
  ctx.arcTo(rect.x, rect.y + rect.h, rect.x, rect.y, r);
  ctx.arcTo(rect.x, rect.y, rect.x + rect.w, rect.y, r);
  ctx.closePath();
};

export const fillRounded = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  radius: number,
  style: string
): void => {
  roundedRectPath(ctx, rect, radius);
  ctx.fillStyle = style;
  ctx.fill();
};

export const circlePath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void => {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
};

export const pill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: string
): void => fillRounded(ctx, { x, y, w, h }, h / 2, style);

export const dot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  style: string
): void => {
  circlePath(ctx, x, y, r);
  ctx.fillStyle = style;
  ctx.fill();
};

export const tint = (palette: FeatureCanvasPalette, t: number, alpha = 1): string =>
  rgba(mixRgb(palette.muted, palette.accent, t), alpha);

export const strokeTick = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  t: number
): void => {
  const first = clamp01(t / 0.4);
  const second = clamp01((t - 0.4) / 0.6);
  const ax = cx - r * 0.5;
  const ay = cy + r * 0.05;
  const bx = cx - r * 0.12;
  const by = cy + r * 0.42;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + (bx - ax) * first, ay + (by - ay) * first);
  if (second > 0) {
    ctx.lineTo(bx + (cx + r * 0.55 - bx) * second, by + (cy - r * 0.4 - by) * second);
  }
  ctx.stroke();
};

export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  style: string,
  align: CanvasTextAlign = "left",
  bold = false
): void => {
  ctx.font = `${bold ? "bold " : ""}${Math.max(1, Math.round(size))}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = style;
  ctx.fillText(value, x, y);
};
