import { clamp01, easeInOutCubic, easeOutBack, staggerProgress } from "../easing";
import { BUILDER_BLOCK_COUNT, builderLayout, lerpRect } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { roundedRectPath } from "./shared";

const HOP_MS = 1300;
const MOVE_SHARE = 0.45;
const FLASH_SHARE = 0.35;
const SELECTION_ORDER = [1, 2, 3, 4, 0, 5] as const;
const DASH: number[] = [4, 4];
const NO_DASH: number[] = [];

const skeleton = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string
): void => {
  roundedRectPath(ctx, { x, y, w, h }, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
};

const drawBlockBody = (dc: DrawContext, index: number, r: Rect): void => {
  const { ctx, palette, progress } = dc;
  const soft = rgba(palette.muted, 0.4);
  const pad = Math.min(r.w, r.h) * 0.12;
  if (index === 0) {
    const d = r.h * 0.5;
    ctx.beginPath();
    ctx.arc(r.x + pad + d / 2, r.y + r.h / 2, d / 2, 0, Math.PI * 2);
    ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, progress), 0.9);
    ctx.fill();
    for (let nav = 0; nav < 3; nav += 1) {
      skeleton(
        ctx,
        r.x + r.w - pad - (nav + 1) * r.w * 0.13 - nav * 4,
        r.y + r.h * 0.4,
        r.w * 0.1,
        r.h * 0.2,
        soft
      );
    }
    return;
  }
  const strong = rgba(palette.strong, 0.5);
  if (index === 1) {
    skeleton(ctx, r.x + pad, r.y + r.h * 0.16, r.w * 0.55, r.h * 0.13, strong);
    skeleton(ctx, r.x + pad, r.y + r.h * 0.34, r.w * 0.38, r.h * 0.13, strong);
    skeleton(ctx, r.x + pad, r.y + r.h * 0.56, r.w * 0.65, r.h * 0.07, soft);
    skeleton(
      ctx,
      r.x + pad,
      r.y + r.h * 0.72,
      r.w * 0.2,
      r.h * 0.16,
      rgba(mixRgb(palette.muted, palette.accent, progress), 0.75)
    );
    return;
  }
  if (index === 5) {
    skeleton(ctx, r.x + pad, r.y + r.h * 0.38, r.w * 0.2, r.h * 0.24, soft);
    skeleton(ctx, r.x + r.w * 0.4, r.y + r.h * 0.38, r.w * 0.2, r.h * 0.24, soft);
    skeleton(ctx, r.x + r.w * 0.7, r.y + r.h * 0.38, r.w * 0.2, r.h * 0.24, soft);
    return;
  }
  roundedRectPath(ctx, { x: r.x + pad, y: r.y + pad, w: r.w - pad * 2, h: r.h * 0.45 }, 3);
  ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, progress * 0.35), 0.28);
  ctx.fill();
  skeleton(ctx, r.x + pad, r.y + r.h * 0.67, r.w * 0.6, r.h * 0.08, strong);
  skeleton(ctx, r.x + pad, r.y + r.h * 0.82, r.w * 0.38, r.h * 0.08, soft);
};

const drawBlock = (dc: DrawContext, index: number, r: Rect): void => {
  const { ctx, width, height, progress, palette } = dc;
  const local = staggerProgress(progress, index, BUILDER_BLOCK_COUNT, 0.5);
  const settle = Math.min(1.04, easeOutBack(local, 1.2));
  const away = 1 - settle;
  const dx = Math.sin(index * 2.3 + 1) * width * 0.05 * away;
  const dy = Math.cos(index * 1.7 + 2) * height * 0.05 * away;
  const scale = 0.92 + 0.08 * settle;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.5 * clamp01(local * 1.4);
  ctx.translate(cx + dx, cy + dy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  roundedRectPath(ctx, r, 4);
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.strong, 0.45);
  ctx.stroke();
  drawBlockBody(dc, index, r);
  ctx.restore();
};

const drawSelection = (dc: DrawContext, blocks: readonly Rect[], frame: Rect): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  const step = Math.floor(time / HOP_MS);
  const phase = (time % HOP_MS) / HOP_MS;
  const to = blocks[SELECTION_ORDER[step % SELECTION_ORDER.length]];
  const from =
    blocks[SELECTION_ORDER[(step + SELECTION_ORDER.length - 1) % SELECTION_ORDER.length]];
  const sel = lerpRect(from, to, easeInOutCubic(phase / MOVE_SHARE));
  const alpha = clamp01(progress * 1.5);
  const unit = Math.max(0.7, Math.min(width / 300, height / 200));

  const flash = clamp01(1 - (phase - MOVE_SHARE) / FLASH_SHARE) * (phase >= MOVE_SHARE ? 1 : 0);
  if (flash > 0) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.accent, 0.55 * flash * alpha);
    ctx.beginPath();
    ctx.moveTo(frame.x, to.y);
    ctx.lineTo(frame.x + frame.w, to.y);
    ctx.moveTo(frame.x, to.y + to.h);
    ctx.lineTo(frame.x + frame.w, to.y + to.h);
    ctx.moveTo(to.x, frame.y);
    ctx.lineTo(to.x, frame.y + frame.h);
    ctx.moveTo(to.x + to.w, frame.y);
    ctx.lineTo(to.x + to.w, frame.y + frame.h);
    ctx.stroke();
  }

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = rgba(palette.accent, alpha);
  ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);

  const handle = 4 * unit;
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.lineWidth = 1;
  const corners = [
    [sel.x, sel.y],
    [sel.x + sel.w, sel.y],
    [sel.x, sel.y + sel.h],
    [sel.x + sel.w, sel.y + sel.h],
  ];
  corners.forEach(([x, y]) => {
    ctx.fillRect(x - handle / 2, y - handle / 2, handle, handle);
    ctx.strokeRect(x - handle / 2, y - handle / 2, handle, handle);
  });

  const tipX = sel.x + sel.w + handle * 0.8;
  const tipY = sel.y + sel.h + handle * 0.8;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX, tipY + 11 * unit);
  ctx.lineTo(tipX + 3 * unit, tipY + 8.5 * unit);
  ctx.lineTo(tipX + 5.5 * unit, tipY + 13 * unit);
  ctx.lineTo(tipX + 7.5 * unit, tipY + 12 * unit);
  ctx.lineTo(tipX + 5 * unit, tipY + 7.5 * unit);
  ctx.lineTo(tipX + 9 * unit, tipY + 7.5 * unit);
  ctx.closePath();
  ctx.fillStyle = rgba(palette.strong, alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(palette.surface, alpha);
  ctx.stroke();
};

export const drawLayoutBuilder = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const { frame, blocks } = builderLayout(width, height);

  ctx.save();
  ctx.setLineDash(DASH);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.7);
  roundedRectPath(ctx, frame, 6);
  ctx.stroke();
  ctx.setLineDash(NO_DASH);
  ctx.restore();

  blocks.forEach((block, index) => drawBlock(dc, index, block));

  if (progress > 0) {
    drawSelection(dc, blocks, frame);
  }
};
