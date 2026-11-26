import { clamp01, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, strokeTick, tint } from "./shared";

const FALLBACK_LABELS = ["Cart", "Payment", "Done"] as const;
const TOTAL = 249;
const STEP_X = [0.16, 0.5, 0.84] as const;
const QUANTITIES = ["×2", "×1"] as const;

export const drawCheckoutFlow = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const strong = rgba(palette.strong, 0.5);
  const stepY = area.y + area.h * 0.1;
  const dotR = area.h * 0.05;
  const left = area.x + area.w * STEP_X[0];
  const right = area.x + area.w * STEP_X[2];

  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.beginPath();
  ctx.moveTo(left, stepY);
  ctx.lineTo(right, stepY);
  ctx.stroke();
  if (progress > 0) {
    ctx.strokeStyle = tint(palette, progress);
    ctx.beginPath();
    ctx.moveTo(left, stepY);
    ctx.lineTo(left + (right - left) * progress, stepY);
    ctx.stroke();
  }
  ctx.font = `${Math.round(area.h * 0.07)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  STEP_X.forEach((fraction, index) => {
    const reached = clamp01((progress - index * 0.45) / 0.1);
    const x = area.x + area.w * fraction;
    dot(ctx, x, stepY, dotR * 1.3, rgba(palette.surface, 1));
    dot(ctx, x, stepY, dotR, tint(palette, reached));
    ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accent, reached), 1);
    ctx.fillText(labels[index] || FALLBACK_LABELS[index], x, stepY + area.h * 0.13);
  });

  const body = { x: area.x, y: area.y + area.h * 0.34, w: area.w, h: area.h * 0.66 };
  const pad = body.h * 0.08;
  fillRounded(ctx, body, 8, rgba(palette.surface, 1));
  roundedRectPath(ctx, body, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.stroke();

  const cart = 1 - clamp01((progress - 0.65) / 0.15);
  if (cart > 0) {
    ctx.save();
    ctx.globalAlpha = cart;
    const size = body.h * 0.2;
    const colW = body.w * 0.46;
    const x0 = body.x + pad;
    for (let index = 0; index < QUANTITIES.length; index += 1) {
      const y = body.y + pad + index * body.h * 0.26;
      fillRounded(ctx, { x: x0, y, w: size, h: size }, 5, rgba(palette.muted, 0.35));
      pill(ctx, x0 + size * 1.3, y + size * 0.15, colW * 0.45, size * 0.24, strong);
      pill(ctx, x0 + size * 1.3, y + size * 0.6, colW * 0.3, size * 0.2, soft);
      ctx.font = `${Math.round(size * 0.4)}px monospace`;
      ctx.textAlign = "right";
      ctx.fillStyle = rgba(palette.strong, 1);
      ctx.fillText(QUANTITIES[index], x0 + colW, y + size / 2);
    }
    const totalY = body.y + body.h - pad - size * 0.2;
    pill(ctx, x0, totalY - size * 0.1, colW * 0.4, size * 0.2, soft);
    ctx.font = `bold ${Math.round(size * 0.5)}px monospace`;
    ctx.fillStyle = tint(palette, progress);
    ctx.fillText(String(Math.round(TOTAL * progress)), x0 + colW, totalY);

    const slide = easeOutCubic(progress / 0.5);
    const colX = body.x + body.w * 0.56;
    const colR = body.w * 0.38;
    ctx.globalAlpha = cart * (0.5 + 0.5 * slide);
    const cardRect = {
      x: colX + (1 - slide) * colR * 0.6,
      y: body.y + pad,
      w: colR,
      h: body.h * 0.36,
    };
    fillRounded(ctx, cardRect, 6, tint(palette, progress, 0.15 + 0.1 * progress));
    roundedRectPath(ctx, cardRect, 6);
    ctx.strokeStyle = tint(palette, progress);
    ctx.stroke();
    fillRounded(
      ctx,
      {
        x: cardRect.x + colR * 0.08,
        y: cardRect.y + cardRect.h * 0.15,
        w: colR * 0.18,
        h: cardRect.h * 0.22,
      },
      3,
      tint(palette, progress, 0.9)
    );
    pill(
      ctx,
      cardRect.x + colR * 0.08,
      cardRect.y + cardRect.h * 0.6,
      colR * 0.7,
      cardRect.h * 0.12,
      strong
    );
    ctx.globalAlpha = cart;
    pill(ctx, colX, body.y + body.h * 0.56, colR, body.h * 0.1, soft);
    pill(ctx, colX, body.y + body.h * 0.72, colR * 0.6, body.h * 0.1, soft);
    ctx.restore();
  }

  const done = clamp01((progress - 0.7) / 0.2);
  if (done > 0) {
    const cx = body.x + body.w / 2;
    const cy = body.y + body.h * 0.45;
    const r = body.h * 0.3 * easeOutCubic(done);
    ctx.globalAlpha = done;
    dot(ctx, cx, cy, r * 1.25, tint(palette, 1, 0.15));
    dot(ctx, cx, cy, r, rgba(palette.accent, 1));
    ctx.lineWidth = Math.max(2, r * 0.16);
    ctx.strokeStyle = rgba(palette.surface, 1);
    strokeTick(ctx, cx, cy, r, clamp01((progress - 0.8) / 0.2));
    pill(ctx, cx - body.w * 0.15, body.y + body.h * 0.84, body.w * 0.3, body.h * 0.06, soft);
    ctx.globalAlpha = 1;
  }
};
