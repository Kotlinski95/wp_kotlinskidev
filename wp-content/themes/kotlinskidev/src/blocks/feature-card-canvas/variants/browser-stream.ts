import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { roundedRectPath } from "./shared";

const GRID = 24;
const WINDOW_RADIUS = 10;

const drawGrid = ({ ctx, width, height, palette }: DrawContext): void => {
  ctx.strokeStyle = rgba(palette.strong, 0.16);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = GRID; x < width; x += GRID) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = GRID; y < height; y += GRID) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
};

const drawWindow = (dc: DrawContext, win: Rect): void => {
  const { ctx, palette } = dc;
  roundedRectPath(ctx, win, WINDOW_RADIUS);
  ctx.fillStyle = rgba(palette.surface, 0.92);
  ctx.fill();
  ctx.strokeStyle = rgba(palette.strong, 0.5);
  ctx.lineWidth = 1;
  ctx.stroke();

  [0, 1, 2].forEach((index) => {
    ctx.beginPath();
    ctx.arc(win.x + 14 + index * 12, win.y + 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.strong, 0.55);
    ctx.fill();
  });

  const bodyTop = win.y + 28;
  const sidebarWidth = win.w * 0.22;
  ctx.strokeStyle = rgba(palette.strong, 0.35);
  ctx.beginPath();
  ctx.moveTo(win.x, bodyTop);
  ctx.lineTo(win.x + win.w, bodyTop);
  ctx.moveTo(win.x + sidebarWidth, bodyTop);
  ctx.lineTo(win.x + sidebarWidth, win.y + win.h);
  ctx.stroke();

  ctx.strokeStyle = rgba(palette.strong, 0.5);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let index = 0; index < 5; index += 1) {
    const y = bodyTop + 14 + index * 14;
    ctx.moveTo(win.x + 10, y);
    ctx.lineTo(win.x + sidebarWidth - 10 - (index % 2) * 8, y);
  }
  ctx.stroke();

  const contentLeft = win.x + sidebarWidth + 12;
  const contentWidth = win.x + win.w - contentLeft - 12;
  const blockHeight = Math.max(8, (win.y + win.h - bodyTop - 36) / 3);
  [0.9, 0.6, 0.75].forEach((ratio, index) => {
    const block: Rect = {
      x: contentLeft,
      y: bodyTop + 12 + index * (blockHeight + 8),
      w: contentWidth * ratio,
      h: blockHeight,
    };
    roundedRectPath(ctx, block, 4);
    ctx.fillStyle = rgba(palette.strong, 0.2);
    ctx.fill();
  });
};

const roundedPerimeter = (win: Rect, radius: number): number => {
  const r = Math.min(radius, win.w / 2, win.h / 2);
  return 2 * (win.w + win.h) - 8 * r + 2 * Math.PI * r;
};

const drawTrace = (dc: DrawContext, win: Rect): void => {
  const { ctx, palette, progress, time } = dc;
  if (progress <= 0) {
    return;
  }
  const perimeter = roundedPerimeter(win, WINDOW_RADIUS);
  const segment = perimeter * (0.15 + 0.55 * progress);
  const head = ((time * 0.0002) % 1) * perimeter;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(palette.accent, progress);
  ctx.shadowColor = rgba(palette.accentGlow, progress * 0.8);
  ctx.shadowBlur = 8 * progress;
  ctx.setLineDash([segment, perimeter - segment]);
  ctx.lineDashOffset = segment - head;
  roundedRectPath(ctx, win, WINDOW_RADIUS);
  ctx.stroke();
  ctx.restore();
};

export const drawBrowserStream = (dc: DrawContext): void => {
  const { ctx, width, height } = dc;
  ctx.clearRect(0, 0, width, height);
  drawGrid(dc);
  const win: Rect = { x: width * 0.075, y: height * 0.075, w: width * 0.85, h: height * 0.85 };
  drawWindow(dc, win);
  drawTrace(dc, win);
};
