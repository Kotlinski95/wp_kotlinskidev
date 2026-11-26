import { clamp01, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const PAGE_SCREENS = 2.2;
const CARD_COUNT = 3;

export const drawSiteScroll = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const bar = area.h * 0.13;
  const vw = area.w;
  const vh = area.h - bar;
  const offset = vh * (PAGE_SCREENS - 1) * progress;
  const soft = rgba(palette.muted, 0.4);
  const strong = rgba(palette.strong, 0.5);
  const card = rgba(palette.line, 0.35);
  const margin = vw * 0.06;

  fillRounded(ctx, area, 8, rgba(palette.surface, 1));
  ctx.save();
  roundedRectPath(ctx, area, 8);
  ctx.clip();
  ctx.translate(area.x, area.y + bar - offset);

  const reveal = (y: number): number => clamp01((vh - (y - offset)) / (vh * 0.35));
  const enter = (y: number, draw: () => void): void => {
    const v = reveal(y);
    ctx.save();
    ctx.globalAlpha = v;
    ctx.translate(0, (1 - easeOutCubic(v)) * vh * 0.12);
    draw();
    ctx.restore();
  };

  dot(ctx, margin + vh * 0.06, vh * 0.1, vh * 0.06, tint(palette, progress, 0.9));
  for (let nav = 0; nav < 3; nav += 1) {
    pill(ctx, vw - margin - (nav + 1) * vw * 0.12, vh * 0.07, vw * 0.09, vh * 0.06, soft);
  }
  pill(ctx, margin, vh * 0.3, vw * 0.6, vh * 0.1, strong);
  pill(ctx, margin, vh * 0.45, vw * 0.42, vh * 0.1, strong);
  pill(ctx, margin, vh * 0.62, vw * 0.5, vh * 0.045, soft);
  pill(ctx, margin, vh * 0.76, vw * 0.22, vh * 0.13, tint(palette, progress, 0.85));

  const gap = vw * 0.03;
  const cardW = (vw - margin * 2 - gap * (CARD_COUNT - 1)) / CARD_COUNT;
  for (let index = 0; index < CARD_COUNT; index += 1) {
    const x = margin + index * (cardW + gap);
    enter(vh * (1.15 + index * 0.06), () => {
      fillRounded(ctx, { x, y: vh * 1.15, w: cardW, h: vh * 0.55 }, 6, card);
      dot(ctx, x + cardW * 0.22, vh * 1.15 + vh * 0.14, vh * 0.06, tint(palette, progress, 0.9));
      pill(ctx, x + cardW * 0.14, vh * 1.15 + vh * 0.28, cardW * 0.7, vh * 0.05, strong);
      pill(ctx, x + cardW * 0.14, vh * 1.15 + vh * 0.38, cardW * 0.5, vh * 0.04, soft);
    });
  }

  const ripple = clamp01((progress - 0.85) / 0.15);
  const ctaW = vw * 0.3;
  const ctaH = vh * 0.13;
  const ctaX = (vw - ctaW) / 2;
  const ctaY = vh * 1.93;
  ctx.fillStyle = card;
  ctx.fillRect(0, vh * 1.85, vw, vh * (PAGE_SCREENS - 1.85));
  pill(ctx, ctaX, ctaY, ctaW, ctaH, tint(palette, clamp01((progress - 0.7) / 0.3)));
  pill(ctx, vw * 0.3, vh * 2.12, vw * 0.4, vh * 0.035, soft);
  if (progress > 0.85) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(palette.accent, 1 - ripple);
    roundedRectPath(
      ctx,
      {
        x: ctaX - ripple * ctaH,
        y: ctaY - ripple * ctaH * 0.5,
        w: ctaW + ripple * ctaH * 2,
        h: ctaH + ripple * ctaH,
      },
      (ctaH + ripple * ctaH) / 2
    );
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, area, 8);
  ctx.clip();
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fillRect(area.x, area.y, vw, bar);
  ctx.fillStyle = rgba(palette.line, 0.9);
  ctx.fillRect(area.x, area.y + bar - 1, vw, 1);
  for (let index = 0; index < 3; index += 1) {
    dot(ctx, area.x + bar * (0.5 + index * 0.45), area.y + bar / 2, bar * 0.11, soft);
  }
  pill(ctx, area.x + bar * 2.1, area.y + bar * 0.3, vw * 0.5, bar * 0.4, soft);
  const trackY = area.y + bar + 4;
  const trackH = vh - 8;
  const thumbH = (trackH / PAGE_SCREENS) * 1;
  pill(
    ctx,
    area.x + vw - 5,
    trackY + (trackH - thumbH) * progress,
    3,
    thumbH,
    tint(palette, progress, 0.4 + 0.5 * progress)
  );
  ctx.restore();

  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(mixRgb(palette.line, palette.accent, progress), 1);
  roundedRectPath(ctx, area, 8);
  ctx.stroke();
};
