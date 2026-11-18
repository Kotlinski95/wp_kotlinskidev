import { clamp01 } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { drawLabel, fillRounded, roundedRectPath, tint } from "./shared";

export interface Scene {
  dc: DrawContext;
  inner: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  text: number;
  small: number;
}

export const CHAR_WIDTH = 0.62;
export const DASH: number[] = [3, 3];
export const NO_DASH: number[] = [];

export const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

export const fit = (chars: number, room: number, base: number): number =>
  Math.max(6, Math.min(base, room / (chars * CHAR_WIDTH)));

export const part = (rect: Rect, u: number, v: number, w: number, h: number): Rect => ({
  x: rect.x + u * rect.w,
  y: rect.y + v * rect.h,
  w: w * rect.w,
  h: h * rect.h,
});

export const createScene = (dc: DrawContext): Scene => {
  const area = fitFullArea(dc.width, dc.height);
  const inner = {
    x: area.x + area.w * 0.05,
    y: area.y + area.h * 0.05,
    w: area.w * 0.9,
    h: area.h * 0.93,
  };
  const { palette } = dc;
  return {
    dc,
    inner,
    box: (u, v, w, h) => part(inner, u, v, w, h),
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    text: Math.max(7, inner.h * 0.034),
    small: Math.max(6, inner.h * 0.028),
  };
};

export const outlineRect = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  radius: number,
  style: string,
  width = 1
): void => {
  roundedRectPath(ctx, rect, radius);
  ctx.lineWidth = width;
  ctx.strokeStyle = style;
  ctx.stroke();
};

export const panel = (scene: Scene, rect: Rect, radius: number, on: number): void => {
  fillRounded(scene.dc.ctx, rect, radius, scene.surface);
  outlineRect(scene.dc.ctx, rect, radius, tint(scene.dc.palette, on, 0.35 + 0.6 * on));
};

export const chipWidth = (label: string, font: number): number =>
  label.length * font * CHAR_WIDTH + 10;

export const chip = (
  scene: Scene,
  x: number,
  y: number,
  label: string,
  font: number,
  on: number,
  height = font * 1.8
): number => {
  const { ctx, palette } = scene.dc;
  const width = chipWidth(label, font);
  const rect = { x, y, w: width, h: height };
  fillRounded(ctx, rect, height / 2, tint(palette, on, 0.1 + 0.16 * on));
  outlineRect(ctx, rect, height / 2, tint(palette, on, 0.3 + 0.6 * on));
  drawLabel(ctx, label, x + width / 2, y + height / 2, font, scene.ink, "center", on > 0.5);
  return width;
};

export const chipRow = (
  scene: Scene,
  row: Rect,
  labels: readonly string[],
  on: number,
  align: "left" | "right" = "left"
): void => {
  const total = labels.reduce((sum, label) => sum + label.length, 0);
  const font = fit(total, row.w - labels.length * 14, scene.small);
  const widths = labels.map((label) => chipWidth(label, font));
  const used = widths.reduce((sum, width) => sum + width, 0) + (labels.length - 1) * 4;
  let cursor = align === "left" ? row.x : row.x + row.w - used;
  labels.forEach((label, index) => {
    chip(scene, cursor, row.y + (row.h - font * 1.8) / 2, label, font, on);
    cursor += widths[index] + 4;
  });
};

export const drawWifi = (scene: Scene, cx: number, cy: number, r: number, off: number): void => {
  const { ctx, palette } = scene.dc;
  ctx.lineCap = "round";
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, (1 - off) * scene.dc.progress, 0.5 + 0.4 * (1 - off));
  [1, 0.62, 0.3].forEach((k) => {
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.5, Math.max(0, r * k), Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  });
  if (off > 0) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.8, cy - r * 0.4);
    ctx.lineTo(cx - r * 0.8 + r * 1.6 * off, cy - r * 0.4 + r * 1.4 * off);
    ctx.strokeStyle = scene.muted;
    ctx.stroke();
  }
};
