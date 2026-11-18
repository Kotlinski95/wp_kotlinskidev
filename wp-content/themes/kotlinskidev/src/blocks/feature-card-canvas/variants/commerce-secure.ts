import { clamp01, staggerProgress } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { fillRounded, pill, roundedRectPath, strokeTick, tint } from "./shared";

const STAGES = 4;

export const drawCommerceSecure = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const cx = area.x + area.w / 2;
  const shieldH = area.h * 0.52;
  const half = shieldH * 0.4;
  const top = area.y;

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
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();

  const lockW = half * 0.7;
  const lockH = lockW * 0.78;
  const lockY = top + shieldH * 0.5;
  ctx.beginPath();
  ctx.arc(cx, lockY - lockH * 0.1, lockW * 0.3, Math.PI, 0);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  fillRounded(
    ctx,
    { x: cx - lockW / 2, y: lockY - lockH * 0.1, w: lockW, h: lockH },
    2,
    tint(palette, progress)
  );

  const tag = {
    x: area.x + area.w * 0.72,
    y: area.y + area.h * 0.12,
    w: area.w * 0.28,
    h: area.h * 0.15,
  };
  fillRounded(ctx, tag, tag.h / 2, rgba(palette.surface, 1));
  roundedRectPath(ctx, tag, tag.h / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.9);
  ctx.stroke();
  ctx.font = `${Math.round(tag.h * 0.55)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(palette.strong, 1);
  ctx.fillText("v2.4", tag.x + tag.w / 2, tag.y + tag.h / 2 + 0.5);
  pill(ctx, area.x, area.y + area.h * 0.14, area.w * 0.2, area.h * 0.05, soft);
  pill(ctx, area.x, area.y + area.h * 0.26, area.w * 0.14, area.h * 0.05, soft);

  const nodeW = area.w * 0.19;
  const nodeH = area.h * 0.22;
  const rowY = area.y + area.h * 0.8;
  const centres = Array.from(
    { length: STAGES },
    (_stage, index) => area.x + area.w * (0.125 + 0.25 * index)
  );
  const locals = centres.map((_x, index) => staggerProgress(progress, index, STAGES, 0.65));
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (let index = 0; index < STAGES - 1; index += 1) {
    const from = centres[index] + nodeW / 2;
    const to = centres[index + 1] - nodeW / 2;
    ctx.strokeStyle = rgba(palette.line, 0.9);
    ctx.beginPath();
    ctx.moveTo(from, rowY);
    ctx.lineTo(to, rowY);
    ctx.stroke();
    if (locals[index] > 0) {
      ctx.strokeStyle = tint(palette, progress);
      ctx.beginPath();
      ctx.moveTo(from, rowY);
      ctx.lineTo(from + (to - from) * locals[index], rowY);
      ctx.stroke();
    }
  }
  centres.forEach((x, index) => {
    const rect = { x: x - nodeW / 2, y: rowY - nodeH / 2, w: nodeW, h: nodeH };
    fillRounded(ctx, rect, 5, rgba(palette.surface, 1));
    roundedRectPath(ctx, rect, 5);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, locals[index], 0.9);
    ctx.stroke();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = tint(palette, locals[index], locals[index]);
    strokeTick(ctx, x, rowY, nodeH * 0.34, locals[index]);
  });

  const sweep = clamp01(progress);
  if (sweep > 0 && sweep < 1) {
    const alpha = Math.sin(Math.PI * sweep);
    const x = area.x + area.w * sweep;
    const y0 = rowY - nodeH * 0.8;
    ctx.fillStyle = rgba(palette.accentGlow, 0.1 * alpha);
    ctx.fillRect(x - area.w * 0.05, y0, area.w * 0.05, nodeH * 1.6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, 1, 0.8 * alpha);
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 + nodeH * 1.6);
    ctx.stroke();
  }
};
