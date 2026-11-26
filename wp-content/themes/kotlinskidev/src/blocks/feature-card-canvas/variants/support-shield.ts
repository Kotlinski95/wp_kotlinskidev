import { clamp01 } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, strokeTick, tint } from "./shared";

const FALLBACK_LABELS = ["Uptime", "Backups"] as const;
const BARS = 30;
const ECG: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.1, 0],
  [0.15, 0.15],
  [0.2, 0],
  [0.3, 0],
  [0.33, -0.2],
  [0.38, 1],
  [0.43, -0.35],
  [0.47, 0],
  [0.6, 0],
  [0.68, 0.25],
  [0.76, 0],
  [1, 0],
];
const TICKET_WIDTHS = [0.7, 0.55, 0.62] as const;

export const drawSupportShield = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h * 0.36;
  const shieldH = area.h * 0.56;
  const half = shieldH * 0.4;

  const period = area.w * 0.5;
  const shift = progress > 0 ? (time * 0.06) % period : 0;
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.w, area.h);
  ctx.clip();
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.strokeStyle = progress > 0 ? tint(palette, progress, 0.6) : rgba(palette.line, 0.9);
  ctx.beginPath();
  for (let cycle = -1; cycle < 3; cycle += 1) {
    ECG.forEach(([u, v]) => {
      const x = area.x - shift + (cycle + u) * period;
      const y = cy - v * shieldH * 0.3;
      return cycle === -1 && u === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
  }
  ctx.stroke();
  ctx.restore();

  const top = cy - shieldH / 2;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + half, top + shieldH * 0.18);
  ctx.lineTo(cx + half, top + shieldH * 0.55);
  ctx.quadraticCurveTo(cx + half, top + shieldH * 0.85, cx, top + shieldH);
  ctx.quadraticCurveTo(cx - half, top + shieldH * 0.85, cx - half, top + shieldH * 0.55);
  ctx.lineTo(cx - half, top + shieldH * 0.18);
  ctx.closePath();
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fill();
  ctx.fillStyle = tint(palette, progress, 0.15 * progress);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, shieldH * 0.06);
  ctx.lineCap = "round";
  strokeTick(ctx, cx, cy - shieldH * 0.02, half * 0.75, 1);

  const cloudX = area.x + area.w * 0.17;
  const cloudY = cy;
  const r = area.h * 0.1;
  const cloud = tint(palette, progress, 0.9);
  dot(ctx, cloudX - r * 0.7, cloudY + r * 0.2, r * 0.55, cloud);
  dot(ctx, cloudX, cloudY - r * 0.1, r * 0.75, cloud);
  dot(ctx, cloudX + r * 0.75, cloudY + r * 0.2, r * 0.5, cloud);
  fillRounded(
    ctx,
    { x: cloudX - r * 0.7, y: cloudY + r * 0.2, w: r * 1.45, h: r * 0.55 },
    2,
    cloud
  );
  const bob = progress > 0 ? Math.sin(time / 280) * r * 0.12 : 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = rgba(palette.surface, 1);
  ctx.beginPath();
  ctx.moveTo(cloudX, cloudY + r * 0.5 + bob);
  ctx.lineTo(cloudX, cloudY - r * 0.2 + bob);
  ctx.moveTo(cloudX - r * 0.25, cloudY + bob);
  ctx.lineTo(cloudX, cloudY - r * 0.25 + bob);
  ctx.lineTo(cloudX + r * 0.25, cloudY + bob);
  ctx.stroke();

  ctx.font = `${Math.round(area.h * 0.07)}px monospace`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = rgba(palette.strong, 1);
  ctx.textAlign = "center";
  ctx.fillText(labels[1] || FALLBACK_LABELS[1], cloudX, cloudY + area.h * 0.28);
  ctx.textAlign = "left";
  ctx.fillText(labels[0] || FALLBACK_LABELS[0], area.x, area.y + area.h * 0.76);

  const listX = area.x + area.w * 0.72;
  const rowH = area.h * 0.17;
  TICKET_WIDTHS.forEach((fraction, index) => {
    const y = cy - rowH * 1.4 + index * rowH * 1.1;
    const done = clamp01(progress * 3 - index);
    dot(ctx, listX, y, rowH * 0.32, soft);
    if (done > 0) {
      dot(ctx, listX, y, rowH * 0.32, rgba(palette.accent, done));
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(palette.surface, done);
      strokeTick(ctx, listX, y, rowH * 0.32, done);
    }
    pill(ctx, listX + rowH * 0.6, y - rowH * 0.1, area.w * 0.26 * fraction, rowH * 0.2, soft);
  });

  const gap = 2;
  const barW = (area.w - gap * (BARS - 1)) / BARS;
  const filled = progress * BARS;
  for (let index = 0; index < BARS; index += 1) {
    fillRounded(
      ctx,
      { x: area.x + index * (barW + gap), y: area.y + area.h * 0.82, w: barW, h: area.h * 0.18 },
      1.5,
      index < filled ? rgba(palette.accent, 1) : soft
    );
  }
};
