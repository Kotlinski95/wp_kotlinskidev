import { clamp01, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const FALLBACK_QUERY = "website near me";
const COLUMNS = [0.15, 0.38, 0.62, 0.85] as const;
const ROWS = [0.3, 0.55, 0.8] as const;
const STARS = 5;

const bounce = (value: number): number => {
  const t = clamp01(value);
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  }
  if (t < 2 / 2.75) {
    const u = t - 1.5 / 2.75;
    return 7.5625 * u * u + 0.75;
  }
  if (t < 2.5 / 2.75) {
    const u = t - 2.25 / 2.75;
    return 7.5625 * u * u + 0.9375;
  }
  const u = t - 2.625 / 2.75;
  return Math.min(1, 7.5625 * u * u + 0.984375);
};

const starPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void => {
  ctx.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
};

export const drawLocalSearch = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const strong = rgba(palette.strong, 0.5);

  fillRounded(ctx, area, 8, rgba(palette.line, 0.25));
  ctx.save();
  roundedRectPath(ctx, area, 8);
  ctx.clip();
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.beginPath();
  COLUMNS.forEach((c) => {
    ctx.moveTo(area.x + area.w * c, area.y);
    ctx.lineTo(area.x + area.w * c, area.y + area.h);
  });
  ROWS.forEach((r) => {
    ctx.moveTo(area.x, area.y + area.h * r);
    ctx.lineTo(area.x + area.w, area.y + area.h * r);
  });
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(area.x, area.y + area.h * 0.9);
  ctx.lineTo(area.x + area.w, area.y + area.h * 0.35);
  ctx.stroke();

  const px = area.x + area.w * 0.78;
  const py = area.y + area.h * 0.66;
  const settle = clamp01((progress - 0.15) / 0.35);
  const headR = area.h * 0.06;
  if (progress > 0) {
    ctx.lineWidth = 1.5;
    const rings = clamp01((progress - 0.4) / 0.2);
    for (let ring = 0; ring < 3; ring += 1) {
      const phase = (time / 1800 + ring / 3) % 1;
      ctx.strokeStyle = rgba(palette.accent, (1 - phase) * 0.5 * rings);
      ctx.beginPath();
      ctx.arc(px, py, phase * area.h * 0.3 * rings + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const lift = (1 - bounce(settle)) * area.h * 0.4;
  ctx.globalAlpha = 0.4 + 0.6 * clamp01(progress / 0.15);
  ctx.beginPath();
  ctx.moveTo(px, py - lift);
  ctx.lineTo(px - headR * 0.85, py - lift - headR * 1.2);
  ctx.arc(px, py - lift - headR * 1.8, headR, Math.PI * 0.8, Math.PI * 0.2, false);
  ctx.closePath();
  ctx.fillStyle = tint(palette, progress);
  ctx.fill();
  dot(ctx, px, py - lift - headR * 1.8, headR * 0.4, rgba(palette.surface, 1));
  ctx.globalAlpha = 1;
  ctx.restore();

  const panel = {
    x: area.x + area.w * 0.06,
    y: area.y + area.h * 0.3,
    w: area.w * 0.5,
    h: area.h * 0.64,
  };
  fillRounded(ctx, panel, 6, rgba(palette.surface, 1));
  const rowH = panel.h / 3;
  const rating = clamp01((progress - 0.5) / 0.5) * STARS;
  for (let index = 0; index < 3; index += 1) {
    const y = panel.y + index * rowH;
    fillRounded(
      ctx,
      { x: panel.x + rowH * 0.15, y: y + rowH * 0.18, w: rowH * 0.64, h: rowH * 0.64 },
      4,
      soft
    );
    const textX = panel.x + rowH * 1;
    if (index === 0) {
      const badgeH = rowH * 0.26;
      pill(ctx, textX, y + rowH * 0.12, badgeH * 1.6, badgeH, tint(palette, progress));
      ctx.font = `bold ${Math.round(badgeH * 0.7)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(palette.surface, 1);
      ctx.fillText("#1", textX + badgeH * 0.8, y + rowH * 0.12 + badgeH / 2 + 0.5);
      for (let star = 0; star < STARS; star += 1) {
        const sx = textX + badgeH * 0.35 + star * rowH * 0.2;
        starPath(ctx, sx, y + rowH * 0.72, rowH * 0.09);
        ctx.fillStyle = rgba(palette.accent, clamp01(rating - star));
        ctx.fill();
        ctx.strokeStyle = rgba(palette.muted, 0.7);
        ctx.stroke();
      }
    } else {
      pill(ctx, textX, y + rowH * 0.28, panel.w * 0.34, rowH * 0.14, strong);
      pill(ctx, textX, y + rowH * 0.56, panel.w * 0.24, rowH * 0.1, soft);
    }
  }

  const bar = {
    x: area.x + area.w * 0.06,
    y: area.y + area.h * 0.06,
    w: area.w * 0.88,
    h: area.h * 0.16,
  };
  fillRounded(ctx, bar, bar.h / 2, rgba(palette.surface, 1));
  roundedRectPath(ctx, bar, bar.h / 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  const mx = bar.x + bar.h * 0.55;
  const my = bar.y + bar.h * 0.46;
  ctx.beginPath();
  ctx.arc(mx, my, bar.h * 0.17, 0, Math.PI * 2);
  ctx.moveTo(mx + bar.h * 0.12, my + bar.h * 0.12);
  ctx.lineTo(mx + bar.h * 0.28, my + bar.h * 0.28);
  ctx.stroke();
  const query = labels[0] || FALLBACK_QUERY;
  const typed = query.slice(0, Math.floor(query.length * easeOutCubic(progress / 0.6)));
  const caret = progress > 0 && progress < 1 && Math.floor(time / 500) % 2 === 0 ? "|" : "";
  ctx.font = `${Math.round(bar.h * 0.46)}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(palette.strong, 1);
  ctx.fillText(`${typed}${caret}`, bar.x + bar.h * 1.05, bar.y + bar.h / 2 + 0.5);
};
