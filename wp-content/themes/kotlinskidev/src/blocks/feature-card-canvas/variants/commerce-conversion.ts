import { clamp01, easeOutCubic } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Point } from "../types";
import { circlePath, fillRounded, pill, roundedRectPath, tint } from "./shared";

const TARGET_UPLIFT = 24;
const BLOBS: ReadonlyArray<readonly [number, number, number]> = [
  [0.74, 0.76, 0.38],
  [0.74, 0.2, 0.2],
  [0.3, 0.4, 0.22],
];

export const drawCommerceConversion = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const page = { x: area.x, y: area.y, w: area.w * 0.64, h: area.h };
  const at = (u: number, v: number): Point => ({ x: page.x + u * page.w, y: page.y + v * page.h });
  const button = { x: at(0.55, 0).x, y: at(0, 0.66).y, w: page.w * 0.38, h: page.h * 0.2 };
  const buttonCentre = { x: button.x + button.w / 2, y: button.y + button.h / 2 };

  fillRounded(ctx, page, 6, rgba(palette.surface, 1));
  fillRounded(
    ctx,
    { x: page.x + page.w * 0.07, y: page.y + page.h * 0.1, w: page.w * 0.4, h: page.h * 0.6 },
    4,
    soft
  );
  pill(ctx, button.x, page.y + page.h * 0.12, button.w, page.h * 0.07, soft);
  pill(ctx, button.x, page.y + page.h * 0.26, button.w * 0.5, page.h * 0.07, soft);
  pill(ctx, button.x, page.y + page.h * 0.42, button.w, page.h * 0.045, soft);
  pill(ctx, button.x, page.y + page.h * 0.51, button.w * 0.7, page.h * 0.045, soft);

  ctx.save();
  roundedRectPath(ctx, page, 6);
  ctx.clip();
  if (progress > 0) {
    const breathe = 1 + Math.sin(time / 420) * 0.04;
    BLOBS.forEach(([u, v, size], index) => {
      const centre = at(u, v);
      const radius =
        page.h * size * (0.25 + 0.75 * clamp01(progress * (1.3 - index * 0.15))) * breathe;
      [1, 0.66, 0.34].forEach((scale) => {
        circlePath(ctx, centre.x, centre.y, radius * scale);
        ctx.fillStyle = rgba(index === 0 ? palette.accent : palette.accentGlow, 0.09 * progress);
        ctx.fill();
      });
    });
  }
  ctx.restore();

  fillRounded(ctx, button, 5, tint(palette, progress, 0.3 + 0.5 * progress));
  pill(
    ctx,
    button.x + button.w * 0.25,
    buttonCentre.y - button.h * 0.09,
    button.w * 0.5,
    button.h * 0.18,
    rgba(palette.surface, 0.9)
  );
  roundedRectPath(ctx, button, 5);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  roundedRectPath(ctx, page, 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.stroke();

  const click = clamp01((progress - 0.55) / 0.45);
  if (click > 0 && click < 1) {
    circlePath(ctx, buttonCentre.x, buttonCentre.y, button.h * (0.3 + 1.1 * click));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = tint(palette, progress, 0.8 * (1 - click));
    ctx.stroke();
  }
  const reach = 1 - easeOutCubic(progress * 1.6);
  const cx = buttonCentre.x + button.w * 0.2 + reach * button.w * 0.5;
  const cy = buttonCentre.y + button.h * 0.2 + reach * button.h * 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + button.h * 0.3, cy + button.h * 0.55);
  ctx.lineTo(cx + button.h * 0.12, cy + button.h * 0.42);
  ctx.lineTo(cx - button.h * 0.06, cy + button.h * 0.62);
  ctx.closePath();
  ctx.fillStyle = rgba(palette.strong, 1);
  ctx.fill();

  const rx = area.x + area.w * 0.84;
  const ry = area.y + area.h * 0.5;
  const unit = area.h * 0.12;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.moveTo(rx - unit * 0.45, ry - unit * 0.85);
  ctx.lineTo(rx, ry - unit * 1.35);
  ctx.lineTo(rx + unit * 0.45, ry - unit * 0.85);
  ctx.moveTo(rx, ry - unit * 1.3);
  ctx.lineTo(rx, ry - unit * 0.3);
  ctx.stroke();
  ctx.font = `bold ${Math.round(area.h * 0.17)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = tint(palette, progress);
  ctx.fillText(
    `+${Math.min(TARGET_UPLIFT, Math.round(TARGET_UPLIFT * progress))}%`,
    rx,
    ry + unit * 0.5
  );
  pill(ctx, rx - area.w * 0.1, ry + unit * 1.5, area.w * 0.2, area.h * 0.04, soft);
};
