import { clamp01, easeOutBack, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { circlePath, dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const FALLBACK_LABELS = ["Next.js", "Angular", "VS"] as const;
const LEFT_LENGTHS = [0.4, 0.34, 0.38] as const;
const RIGHT_LENGTHS = [0.26, 0.2, 0.24] as const;
const ROW_V = [0.4, 0.62, 0.84] as const;
const DIVIDER_TOP = 0.26;
const DIVIDER_SKEW = 0.08;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

export const drawVsFrameworks = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const box = (u: number, v: number, w: number, h: number): Rect => ({
    x: area.x + u * area.w,
    y: area.y + v * area.h,
    w: w * area.w,
    h: h * area.h,
  });
  const soft = rgba(palette.muted, 0.4);
  const faint = rgba(palette.muted, 0.2);
  const strong = rgba(palette.strong, 0.5);
  const surface = rgba(palette.surface, 1);
  const outline = rgba(palette.line, 0.9);
  const dividerX = (v: number): number =>
    area.x +
    area.w * (0.5 + DIVIDER_SKEW / 2 - (DIVIDER_SKEW * (v - DIVIDER_TOP)) / (1 - DIVIDER_TOP));

  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = outline;
  ctx.beginPath();
  ctx.moveTo(dividerX(DIVIDER_TOP), area.y + area.h * DIVIDER_TOP);
  ctx.lineTo(dividerX(1), area.y + area.h);
  ctx.stroke();
  ctx.setLineDash([]);

  const chips = [box(0.02, 0, 0.36, 0.2), box(0.62, 0, 0.36, 0.2)];
  chips.forEach((chip, index) => {
    const lead = index === 0;
    const weight = lead ? progress : 0;
    fillRounded(ctx, chip, chip.h / 2, surface);
    fillRounded(ctx, chip, chip.h / 2, rgba(palette.accent, 0.12 * weight));
    roundedRectPath(ctx, chip, chip.h / 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = lead ? tint(palette, progress, 0.55 + 0.45 * progress) : outline;
    ctx.stroke();
    dot(
      ctx,
      chip.x + chip.h * 0.5,
      chip.y + chip.h / 2,
      chip.h * 0.16,
      lead ? tint(palette, progress, 0.5 + 0.5 * progress) : soft
    );
    ctx.font = `bold ${Math.round(chip.h * 0.34)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = lead
      ? tint(palette, progress, 0.7 + 0.3 * progress)
      : rgba(palette.strong, 0.75);
    ctx.fillText(
      labels[index] || FALLBACK_LABELS[index],
      chip.x + chip.w * 0.58,
      chip.y + chip.h / 2
    );
  });

  ROW_V.forEach((v, index) => {
    const grow = easeOutCubic(seg(progress, 0.1 + index * 0.15, 0.6 + index * 0.15));
    const h = area.h * 0.075;
    const y = area.y + area.h * v - h / 2;
    const startL = area.x + area.w * 0.02;
    const startR = area.x + area.w * 0.98;
    const trackL = area.w * 0.42;
    pill(ctx, startL, y, trackL, h, faint);
    pill(ctx, startR - trackL, y, trackL, h, faint);
    if (grow > 0) {
      pill(
        ctx,
        startL,
        y,
        Math.max(h, area.w * LEFT_LENGTHS[index] * grow),
        h,
        tint(palette, grow, 0.4 + 0.6 * grow)
      );
      pill(
        ctx,
        startR - Math.max(h, area.w * RIGHT_LENGTHS[index] * grow),
        y,
        Math.max(h, area.w * RIGHT_LENGTHS[index] * grow),
        h,
        rgba(palette.strong, 0.35)
      );
    }
    dot(ctx, dividerX(v), area.y + area.h * v, area.h * 0.014, soft);
  });

  const hexX = area.x + area.w * 0.5;
  const hexY = area.y + area.h * 0.12;
  const hexR = area.h * 0.115 * (1 + (progress > 0 ? 0.03 * Math.sin(time / 600) : 0));
  const pop = 0.85 + 0.15 * easeOutBack(seg(progress, 0, 0.5));
  ctx.beginPath();
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = Math.PI / 6 + (corner * Math.PI) / 3;
    const px = hexX + Math.cos(angle) * hexR * pop;
    const py = hexY + Math.sin(angle) * hexR * pop;
    if (corner === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.fillStyle = tint(palette, progress, 0.12 + 0.2 * progress);
  ctx.fill();
  ctx.lineJoin = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  circlePath(ctx, hexX, hexY, hexR * 0.72 * pop);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.35);
  ctx.stroke();
  ctx.font = `bold ${Math.round(hexR * 0.8)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = tint(palette, progress, 0.8 + 0.2 * progress);
  ctx.fillText(labels[2] || FALLBACK_LABELS[2], hexX, hexY + hexR * 0.04);
  pill(ctx, area.x + area.w * 0.2, area.y + area.h * 0.24, area.w * 0.14, area.h * 0.02, strong);
  pill(ctx, area.x + area.w * 0.66, area.y + area.h * 0.24, area.w * 0.14, area.h * 0.02, faint);
};
