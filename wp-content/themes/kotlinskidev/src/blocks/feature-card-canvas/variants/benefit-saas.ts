import { clamp01, easeInOutCubic, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const MRR = [0.15, 0.28, 0.24, 0.45, 0.58, 0.8, 0.95] as const;
const AVATARS = 5;
const JOINED = 12;

export const drawBenefitSaas = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);

  fillRounded(ctx, area, 6, rgba(palette.surface, 1));
  roundedRectPath(ctx, area, 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.stroke();

  const pad = area.w * 0.05;
  const barY = area.y + area.h * 0.08;
  pill(ctx, area.x + pad, barY, area.w * 0.2, area.h * 0.06, soft);
  pill(ctx, area.x + pad + area.w * 0.24, barY, area.w * 0.14, area.h * 0.06, soft);

  const trackW = area.w * 0.24;
  const trackH = area.h * 0.1;
  const trackX = area.x + area.w - pad - trackW;
  const trackY = barY - area.h * 0.02;
  pill(ctx, trackX, trackY, trackW, trackH, tint(palette, progress, 0.3 + 0.4 * progress));
  const knobR = trackH * 0.38;
  dot(
    ctx,
    trackX + trackH / 2 + (trackW - trackH) * easeInOutCubic(progress),
    trackY + trackH / 2,
    knobR,
    rgba(palette.surface, 1)
  );

  const left = area.x + pad;
  const right = area.x + area.w - pad;
  const top = area.y + area.h * 0.28;
  const base = area.y + area.h * 0.7;
  const points = MRR.map((value, index) => ({
    x: left + ((right - left) * index) / (MRR.length - 1),
    y: base - (base - top) * value,
  }));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2;
  const trace = (): void => {
    ctx.beginPath();
    points.forEach((point, index) =>
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)
    );
  };
  ctx.strokeStyle = rgba(palette.line, 0.9);
  trace();
  ctx.stroke();
  if (progress > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 2, area.y, (right - left) * easeOutCubic(progress) + 4, area.h);
    ctx.clip();
    trace();
    ctx.lineTo(right, base);
    ctx.lineTo(left, base);
    ctx.closePath();
    ctx.fillStyle = rgba(palette.accent, 0.18 * progress);
    ctx.fill();
    ctx.strokeStyle = tint(palette, progress);
    trace();
    ctx.stroke();
    ctx.restore();
    const lead = points[points.length - 1];
    dot(ctx, lead.x, lead.y, area.h * (0.03 + 0.008 * Math.sin(time / 300)), tint(palette, 1));
  }

  const avatarR = area.h * 0.075;
  const rowY = area.y + area.h * 0.86;
  for (let index = 0; index < AVATARS; index += 1) {
    const joined = easeOutCubic(clamp01(progress * (AVATARS + 1) * 0.8 - index * 0.8));
    const x = left + avatarR + index * avatarR * 1.4;
    const lift = (1 - joined) * avatarR * 0.8;
    dot(ctx, x, rowY + lift, avatarR + 1.5, rgba(palette.surface, 1));
    dot(ctx, x, rowY + lift, avatarR, tint(palette, joined, 0.45 + 0.5 * joined));
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(area.h * 0.1)}px monospace`;
  ctx.fillStyle = tint(palette, progress);
  ctx.fillText(
    `+${Math.round(JOINED * progress)}`,
    left + avatarR * 2 + (AVATARS - 1) * avatarR * 1.4 + area.w * 0.03,
    rowY
  );
};
