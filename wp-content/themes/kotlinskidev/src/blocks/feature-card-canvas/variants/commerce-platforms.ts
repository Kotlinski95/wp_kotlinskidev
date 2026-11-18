import { staggerProgress } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Point } from "../types";
import { circlePath, dot, fillRounded, roundedRectPath, tint } from "./shared";

const FALLBACK_LABELS = ["Shopify", "WooCommerce", "SAP Hybris", "Magento"] as const;
const SLOTS: readonly Point[] = [
  { x: 0.2, y: 0.12 },
  { x: 0.8, y: 0.12 },
  { x: 0.2, y: 0.88 },
  { x: 0.8, y: 0.88 },
];

export const drawCommercePlatforms = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const hub = { x: area.x + area.w / 2, y: area.y + area.h / 2 };
  const chipW = area.w * 0.36;
  const chipH = area.h * 0.2;
  const centres = SLOTS.map((slot) => ({
    x: Math.min(
      area.x + area.w - chipW / 2,
      Math.max(area.x + chipW / 2, area.x + slot.x * area.w)
    ),
    y: Math.min(
      area.y + area.h - chipH / 2,
      Math.max(area.y + chipH / 2, area.y + slot.y * area.h)
    ),
  }));
  const locals = centres.map((_c, index) => staggerProgress(progress, index, SLOTS.length, 0.6));

  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  centres.forEach((c, index) => {
    ctx.strokeStyle = tint(palette, locals[index], 0.8);
    ctx.beginPath();
    ctx.moveTo(hub.x, hub.y);
    ctx.lineTo(c.x, c.y);
    ctx.stroke();
  });

  const radius = area.h * 0.17;
  circlePath(ctx, hub.x, hub.y, radius);
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  const u = radius * 0.4;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(hub.x - u * 1.3, hub.y - u * 0.9);
  ctx.lineTo(hub.x - u * 0.8, hub.y - u * 0.9);
  ctx.lineTo(hub.x - u * 0.4, hub.y + u * 0.5);
  ctx.lineTo(hub.x + u * 1, hub.y + u * 0.5);
  ctx.lineTo(hub.x + u * 1.2, hub.y - u * 0.5);
  ctx.lineTo(hub.x - u * 0.7, hub.y - u * 0.5);
  ctx.stroke();
  dot(ctx, hub.x - u * 0.2, hub.y + u * 1, u * 0.18, tint(palette, progress));
  dot(ctx, hub.x + u * 0.8, hub.y + u * 1, u * 0.18, tint(palette, progress));

  ctx.font = `${Math.round(area.h * 0.075)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  centres.forEach((c, index) => {
    const rect = { x: c.x - chipW / 2, y: c.y - chipH / 2, w: chipW, h: chipH };
    fillRounded(ctx, rect, chipH / 2, rgba(palette.surface, 1));
    fillRounded(ctx, rect, chipH / 2, rgba(palette.accent, 0.16 * locals[index]));
    roundedRectPath(ctx, rect, chipH / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, locals[index], 0.9);
    ctx.stroke();
    ctx.fillStyle = rgba(palette.strong, 1);
    ctx.fillText(labels[index] || FALLBACK_LABELS[index], c.x, c.y + 0.5, chipW * 0.86);
  });

  if (progress > 0) {
    centres.forEach((c, index) => {
      const phase = (time / 1400 + index / SLOTS.length) % 1;
      const travel = 0.3 + 0.38 * (phase < 0.5 ? phase * 2 : 2 - phase * 2);
      dot(
        ctx,
        hub.x + (c.x - hub.x) * travel,
        hub.y + (c.y - hub.y) * travel,
        Math.max(2, area.h * 0.026),
        rgba(palette.accent, locals[index])
      );
    });
  }
};
