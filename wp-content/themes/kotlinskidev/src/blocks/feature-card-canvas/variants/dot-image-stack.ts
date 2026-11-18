import { mixRgb, rgba } from "../palette";
import { mountainHeight, stackRects } from "../geometry";
import type { DrawContext, Rect } from "../types";
import { roundedRectPath } from "./shared";

const CELL = 4;
const DOT = 2;
const PAD = 8;
const LABEL_BAND = 22;
const LABEL_INSET = 8;
const LABEL_FONT = "10px monospace";

const drawDots = ({ ctx, progress, palette }: DrawContext, screen: Rect, index: number): void => {
  const inner: Rect = {
    x: screen.x + PAD,
    y: screen.y + LABEL_BAND,
    w: screen.w - PAD * 2,
    h: screen.h - LABEL_BAND - PAD,
  };
  if (inner.w <= CELL || inner.h <= CELL) {
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();
  ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 0.4 + 0.35 * progress);
  const columns = Math.floor(inner.w / CELL);
  const rows = Math.floor(inner.h / CELL);
  for (let col = 0; col < columns; col += 1) {
    const localX = col * CELL;
    const top = inner.h - mountainHeight(localX, inner.w, inner.h, index * 2.1 + 0.7);
    for (let row = Math.floor(top / CELL); row < rows; row += 1) {
      ctx.fillRect(inner.x + localX, inner.y + row * CELL, DOT, DOT);
    }
  }
  ctx.restore();
};

export const drawDotImageStack = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const screens = stackRects(width, height, progress);

  screens.forEach((screen, index) => {
    roundedRectPath(ctx, screen, 6);
    ctx.fillStyle = rgba(palette.surface, 1);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.strong, 0.5);
    ctx.stroke();

    drawDots(dc, screen, index);

    const label = labels[index];
    if (label) {
      ctx.font = LABEL_FONT;
      ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accent, Math.max(progress, 0.6)), 1);
      ctx.textBaseline = "top";
      ctx.textAlign = "right";
      ctx.fillText(label, screen.x + screen.w - LABEL_INSET, screen.y + LABEL_INSET);
      ctx.textAlign = "left";
    }
  });
};
