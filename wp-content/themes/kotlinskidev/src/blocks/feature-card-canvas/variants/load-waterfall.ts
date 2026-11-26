import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, pill, tint } from "./shared";

const STARTS = [0, 0.08, 0.16, 0.28, 0.4, 0.52] as const;
const LENGTHS = [0.4, 0.3, 0.34, 0.3, 0.26, 0.22] as const;
const LOAD_FROM = 3.2;
const LOAD_TO = 0.9;
const SCORE = 98;
const SQUEEZE = 0.55;

export const drawLoadWaterfall = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(area.h * 0.22)}px monospace`;
  ctx.fillStyle = tint(palette, progress);
  const seconds = LOAD_FROM + (LOAD_TO - LOAD_FROM) * progress;
  ctx.fillText(`${seconds.toFixed(1)}s`, area.x, area.y + area.h * 0.17);
  pill(ctx, area.x, area.y + area.h * 0.34, area.w * 0.22, area.h * 0.04, soft);

  const ringR = area.h * 0.17;
  const ringX = area.x + area.w - ringR * 1.1;
  const ringY = area.y + area.h * 0.19;
  ctx.lineCap = "round";
  ctx.lineWidth = ringR * 0.22;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
  ctx.stroke();
  if (progress > 0) {
    ctx.strokeStyle = tint(palette, progress);
    ctx.beginPath();
    ctx.arc(
      ringX,
      ringY,
      ringR,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * (SCORE / 100) * progress
    );
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.round(ringR * 0.8)}px monospace`;
  ctx.fillStyle = rgba(palette.strong, 1);
  ctx.fillText(String(Math.round(SCORE * progress)), ringX, ringY + 1);

  const gutter = area.w * 0.12;
  const trackX = area.x + gutter;
  const trackW = area.w - gutter;
  const top = area.y + area.h * 0.44;
  const rowH = (area.h * 0.56) / STARTS.length;
  const squeeze = 1 - SQUEEZE * progress;
  STARTS.forEach((start, index) => {
    const y = top + index * rowH;
    pill(ctx, area.x, y + rowH * 0.3, gutter * 0.7, rowH * 0.4, soft);
    pill(
      ctx,
      trackX + start * squeeze * trackW,
      y + rowH * 0.2,
      Math.max(2, LENGTHS[index] * squeeze * trackW),
      rowH * 0.6,
      tint(palette, progress, 0.35 + 0.5 * progress)
    );
  });
  const markerX = trackX + 0.8 * squeeze * trackW;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.moveTo(markerX, top - rowH * 0.2);
  ctx.lineTo(markerX, top + rowH * STARTS.length);
  ctx.stroke();
  dot(ctx, markerX, top - rowH * 0.2, 3, tint(palette, progress));
};
