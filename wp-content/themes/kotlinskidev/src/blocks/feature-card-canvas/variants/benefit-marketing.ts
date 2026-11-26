import { clamp01 } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const TARGET = 4.8;
const VISITORS = [-0.7, -0.35, 0, 0.4, 0.7, 0.15] as const;
const STAGES = 3;

export const drawBenefitMarketing = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const page = { x: area.x, y: area.y, w: area.w * 0.6, h: area.h };

  fillRounded(ctx, page, 6, rgba(palette.surface, 1));
  roundedRectPath(ctx, page, 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.stroke();

  const padX = page.w * 0.08;
  const innerW = page.w - padX * 2;
  pill(ctx, page.x + padX, page.y + page.h * 0.07, innerW * 0.25, page.h * 0.05, soft);
  pill(
    ctx,
    page.x + page.w - padX - innerW * 0.3,
    page.y + page.h * 0.07,
    innerW * 0.3,
    page.h * 0.05,
    soft
  );
  pill(
    ctx,
    page.x + padX,
    page.y + page.h * 0.2,
    innerW * 0.8,
    page.h * 0.07,
    rgba(palette.strong, 0.5)
  );
  pill(ctx, page.x + padX, page.y + page.h * 0.32, innerW * 0.55, page.h * 0.05, soft);

  const button = {
    x: page.x + padX,
    y: page.y + page.h * 0.45,
    w: innerW * 0.4,
    h: page.h * 0.13,
  };
  const ripple = progress > 0 ? (time / 1100) % 1 : 0;
  if (progress > 0) {
    const cx = button.x + button.w * 0.7;
    const cy = button.y + button.h / 2;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(palette.accent, (1 - ripple) * progress);
    ctx.beginPath();
    ctx.arc(cx, cy, button.h * (0.3 + ripple * 1.1), 0, Math.PI * 2);
    ctx.stroke();
  }
  fillRounded(ctx, button, button.h / 2, tint(palette, progress));

  const counterY = page.y + page.h * 0.82;
  const shown = Math.min(TARGET, TARGET * progress);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(page.h * 0.16)}px monospace`;
  ctx.fillStyle = tint(palette, progress);
  ctx.fillText(`${shown.toFixed(1)}%`, page.x + padX, counterY);
  const arrowX = page.x + page.w - padX - page.h * 0.08;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.moveTo(arrowX - page.h * 0.07, counterY + page.h * 0.05);
  ctx.lineTo(arrowX, counterY - page.h * 0.04);
  ctx.lineTo(arrowX + page.h * 0.07, counterY + page.h * 0.05);
  ctx.stroke();

  const funnelX = area.x + area.w * 0.66;
  const funnelW = area.w * 0.34;
  const stageH = area.h / STAGES;
  for (let stage = 0; stage < STAGES; stage += 1) {
    const top = 1 - stage * 0.3;
    const bottom = 1 - (stage + 1) * 0.3;
    const y = area.y + stage * stageH;
    const reach = clamp01(progress * 3 - stage);
    ctx.beginPath();
    ctx.moveTo(funnelX + (funnelW * (1 - top)) / 2, y + 1);
    ctx.lineTo(funnelX + (funnelW * (1 + top)) / 2, y + 1);
    ctx.lineTo(funnelX + (funnelW * (1 + bottom)) / 2, y + stageH - 1);
    ctx.lineTo(funnelX + (funnelW * (1 - bottom)) / 2, y + stageH - 1);
    ctx.closePath();
    ctx.fillStyle = tint(palette, reach, 0.15 + 0.3 * reach);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, reach, 0.9);
    ctx.stroke();
  }

  if (progress > 0) {
    VISITORS.forEach((offset, index) => {
      const t = (time / 1500 + index / VISITORS.length) % 1;
      const span = 1 - 0.9 * t;
      dot(
        ctx,
        funnelX + funnelW / 2 + offset * (funnelW / 2) * span * 0.8,
        area.y + t * area.h * 0.94 + area.h * 0.03,
        Math.max(1.5, area.h * 0.025),
        tint(palette, 1, progress)
      );
    });
  }
};
