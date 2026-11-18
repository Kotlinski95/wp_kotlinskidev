import { clamp01, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { circlePath, dot, drawLabel, fillRounded, pill, roundedRectPath, tint } from "./shared";

type Glyph = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  style: string,
  time: number
) => void;

const STACK = ["React", "Next.js", "Angular", "WordPress", "TypeScript"] as const;
const CYCLE_MS = 1600;
const CHAR_WIDTH = 0.62;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const line = (
  ctx: CanvasRenderingContext2D,
  style: string,
  width: number,
  points: ReadonlyArray<readonly [number, number]>
): void => {
  ctx.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = style;
  ctx.stroke();
};

const websites: Glyph = (ctx, cx, cy, r, style) => {
  const frame = { x: cx - r, y: cy - r * 0.8, w: r * 2, h: r * 1.6 };
  roundedRectPath(ctx, frame, 3);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = style;
  ctx.stroke();
  line(ctx, style, 1.4, [
    [frame.x, frame.y + r * 0.4],
    [frame.x + frame.w, frame.y + r * 0.4],
  ]);
  dot(ctx, frame.x + r * 0.25, frame.y + r * 0.2, r * 0.07, style);
  dot(ctx, frame.x + r * 0.45, frame.y + r * 0.2, r * 0.07, style);
  line(ctx, style, 1.6, [
    [cx - r * 0.2, cy + r * 0.1],
    [cx - r * 0.5, cy + r * 0.35],
    [cx - r * 0.2, cy + r * 0.6],
  ]);
  line(ctx, style, 1.6, [
    [cx + r * 0.2, cy + r * 0.1],
    [cx + r * 0.5, cy + r * 0.35],
    [cx + r * 0.2, cy + r * 0.6],
  ]);
};

const optimization: Glyph = (ctx, cx, cy, r, style, time) => {
  const flash = 0.85 + 0.15 * Math.sin(time / 260);
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.2 * flash, cy - r);
  ctx.lineTo(cx - r * 0.55, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.25, cy + r);
  ctx.lineTo(cx + r * 0.6, cy - r * 0.2);
  ctx.lineTo(cx + r * 0.05, cy - r * 0.2);
  ctx.closePath();
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.strokeStyle = style;
  ctx.stroke();
};

const performance: Glyph = (ctx, cx, cy, r, style, time) => {
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.3, r, Math.PI * 1.1, Math.PI * 1.9);
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.strokeStyle = style;
  ctx.stroke();
  for (let index = 0; index < 5; index += 1) {
    const angle = Math.PI * (1.15 + index * 0.175);
    line(ctx, style, 1.2, [
      [cx + Math.cos(angle) * r * 0.78, cy + r * 0.3 + Math.sin(angle) * r * 0.78],
      [cx + Math.cos(angle) * r * 0.95, cy + r * 0.3 + Math.sin(angle) * r * 0.95],
    ]);
  }
  const needle = Math.PI * (1.5 + 0.22 * Math.sin(time / 700));
  line(ctx, style, 1.8, [
    [cx, cy + r * 0.3],
    [cx + Math.cos(needle) * r * 0.7, cy + r * 0.3 + Math.sin(needle) * r * 0.7],
  ]);
  dot(ctx, cx, cy + r * 0.3, r * 0.1, style);
  line(ctx, style, 1.4, [
    [cx - r * 0.7, cy + r * 0.85],
    [cx + r * 0.7, cy + r * 0.85],
  ]);
};

const ecommerce: Glyph = (ctx, cx, cy, r, style, time) => {
  line(ctx, style, 1.8, [
    [cx - r, cy - r * 0.7],
    [cx - r * 0.6, cy - r * 0.7],
    [cx - r * 0.3, cy + r * 0.35],
    [cx + r * 0.7, cy + r * 0.35],
    [cx + r * 0.9, cy - r * 0.35],
    [cx - r * 0.5, cy - r * 0.35],
  ]);
  const hop = Math.abs(Math.sin(time / 500)) * r * 0.08;
  dot(ctx, cx - r * 0.1, cy + r * 0.8 - hop, r * 0.17, style);
  dot(ctx, cx + r * 0.55, cy + r * 0.8 - hop, r * 0.17, style);
};

const SERVICES: ReadonlyArray<readonly [string, string, Glyph]> = [
  ["Websites", "React", websites],
  ["Optimization", "Web Vitals", optimization],
  ["Performance", "Audits", performance],
  ["E-commerce", "Checkout", ecommerce],
];

const drawTiles = (dc: DrawContext, area: Rect): readonly number[] => {
  const { ctx, progress, time, palette } = dc;
  const { x, y, w, h } = area;
  const tileW = w * 0.455;
  const tileH = h * 0.34;
  const gapX = w - tileW * 2;
  const gapY = h * 0.05;
  const hub = { x: x + w / 2, y: y + tileH + gapY / 2 };
  const surface = rgba(palette.surface, 1);
  const lits = SERVICES.map((_, index) =>
    easeOutCubic(seg(progress, index * 0.18, 0.25 + index * 0.18))
  );
  const active = Math.floor(time / CYCLE_MS) % SERVICES.length;
  const beat = 0.5 + 0.5 * Math.sin(((time % CYCLE_MS) / CYCLE_MS) * Math.PI);
  const link = Math.max(...lits);
  line(ctx, tint(palette, link, 0.35 + 0.4 * link), 1.2, [
    [x + tileW * 0.5, hub.y],
    [x + w - tileW * 0.5, hub.y],
  ]);
  line(ctx, tint(palette, link, 0.35 + 0.4 * link), 1.2, [
    [hub.x, y + tileH * 0.5],
    [hub.x, y + tileH * 1.5 + gapY],
  ]);
  SERVICES.forEach(([title, sub, glyph], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const tile = { x: x + col * (tileW + gapX), y: y + row * (tileH + gapY), w: tileW, h: tileH };
    const lit = lits[index];
    const pulse = index === active && progress >= 1 ? beat : 0;
    fillRounded(ctx, tile, 7, surface);
    fillRounded(ctx, tile, 7, tint(palette, lit, 0.08 * lit + 0.1 * pulse));
    roundedRectPath(ctx, tile, 7);
    ctx.lineWidth = 1 + pulse * 0.8;
    ctx.strokeStyle = tint(palette, lit, 0.35 + 0.6 * lit);
    ctx.stroke();
    const r = tileH * 0.24;
    const gx = tile.x + tileW * 0.2;
    const gy = tile.y + tileH * 0.46;
    circlePath(ctx, gx, gy, r * 1.35);
    ctx.fillStyle = tint(palette, lit, 0.1 + 0.12 * lit);
    ctx.fill();
    glyph(ctx, gx, gy, r, tint(palette, lit, 0.7 + 0.3 * lit), time * progress);
    const room = tileW * 0.6 - 10;
    const font = Math.max(6, Math.min(h * 0.05, room / (title.length * CHAR_WIDTH)));
    const subFont = Math.max(6, Math.min(font * 0.78, room / (sub.length * CHAR_WIDTH)));
    drawLabel(
      ctx,
      title,
      tile.x + tileW * 0.4,
      tile.y + tileH * 0.36,
      font,
      rgba(palette.strong, 0.85),
      "left",
      true
    );
    drawLabel(
      ctx,
      sub,
      tile.x + tileW * 0.4,
      tile.y + tileH * 0.62,
      subFont,
      rgba(palette.strong, 0.55)
    );
    pill(
      ctx,
      tile.x + tileW * 0.4,
      tile.y + tileH * 0.8,
      tileW * 0.5 * lit,
      tileH * 0.05,
      tint(palette, lit, 0.5)
    );
  });
  dot(ctx, hub.x, hub.y, h * 0.022, surface);
  dot(ctx, hub.x, hub.y, h * 0.014 * (1 + 0.2 * beat * progress), tint(palette, link));
  return lits;
};

const drawStack = (dc: DrawContext, area: Rect): void => {
  const { ctx, progress, time, palette } = dc;
  const total = STACK.reduce((sum, name) => sum + name.length, 0);
  const avail = area.w * 0.84 - STACK.length * 12 - (STACK.length - 1) * 4;
  const font = Math.max(6, Math.min(area.h * 0.04, avail / (total * 0.62)));
  const chipH = font * 1.9;
  const y = area.y + area.h * 0.86;
  const reveal = seg(progress, 0.6, 1);
  let cursor = area.x;
  STACK.forEach((name, index) => {
    const chipW = name.length * font * 0.62 + 12;
    const t = easeOutCubic(seg(reveal, index * 0.14, 0.3 + index * 0.14));
    const lift = (1 - t) * chipH * 0.4;
    ctx.globalAlpha = 0.5 + 0.5 * t;
    pill(ctx, cursor, y - lift, chipW, chipH, tint(palette, t, 0.14 + 0.1 * t));
    roundedRectPath(ctx, { x: cursor, y: y - lift, w: chipW, h: chipH }, chipH / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, t, 0.3 + 0.5 * t);
    ctx.stroke();
    drawLabel(
      ctx,
      name,
      cursor + chipW / 2,
      y - lift + chipH / 2,
      font,
      rgba(palette.strong, 0.85),
      "center"
    );
    ctx.globalAlpha = 1;
    cursor += chipW + 4;
  });
  const arrowX = area.x + area.w - chipH * 0.55 + Math.sin(time / 400) * progress * 2;
  const arrowY = y + chipH / 2;
  const t = easeOutCubic(reveal);
  circlePath(ctx, area.x + area.w - chipH * 0.55, arrowY, chipH * 0.55);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = tint(palette, t, 0.4 + 0.6 * t);
  ctx.stroke();
  line(ctx, tint(palette, t), 1.6, [
    [arrowX - chipH * 0.25, arrowY],
    [arrowX + chipH * 0.25, arrowY],
  ]);
  line(ctx, tint(palette, t), 1.6, [
    [arrowX, arrowY - chipH * 0.2],
    [arrowX + chipH * 0.25, arrowY],
    [arrowX, arrowY + chipH * 0.2],
  ]);
};

export const drawNavServices = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const full = fitFullArea(dc.width, dc.height);
  const inset = Math.round(Math.min(dc.width, dc.height) * 0.05);
  const area: Rect = {
    x: full.x + inset,
    y: full.y + inset,
    w: full.w - inset * 2,
    h: full.h - inset,
  };
  drawTiles(dc, area);
  drawStack(dc, area);
};
