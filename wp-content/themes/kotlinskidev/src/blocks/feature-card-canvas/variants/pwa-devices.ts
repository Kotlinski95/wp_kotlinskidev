import { easeInOutCubic, easeOutBack, easeOutCubic } from "../easing";
import { quadPoint } from "../geometry";
import type { Rect } from "../types";
import { DASH, NO_DASH, type Scene, fit, outlineRect, panel, part, seg } from "./anf-shared";
import { circlePath, dot, drawLabel, fillRounded, pill, tint } from "./shared";

const SLOT = { col: 1, row: 2 };
const COLUMNS = 4;
const ROWS = 3;

export const drawDesktop = (scene: Scene, rect: Rect, c: number): void => {
  const { dc, faint, soft, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  panel(scene, rect, 6, progress);
  const bar = { x: rect.x, y: rect.y, w: rect.w, h: rect.h * 0.16 };
  ctx.fillStyle = faint;
  ctx.fillRect(bar.x + 1, bar.y + bar.h, bar.w - 2, 1);
  [0, 1, 2].forEach((i) =>
    dot(ctx, bar.x + bar.h * (0.7 + i * 0.6), bar.y + bar.h / 2, bar.h * 0.14, soft)
  );
  const url = {
    x: bar.x + bar.h * 2.8,
    y: bar.y + bar.h * 0.2,
    w: Math.max(0, bar.w - bar.h * 3.8),
    h: bar.h * 0.6,
  };
  pill(ctx, url.x, url.y, url.w, url.h, faint);
  drawLabel(
    ctx,
    "app.example",
    url.x + 6,
    url.y + url.h / 2,
    fit(11, url.w * 0.6, small * 0.9),
    muted,
    "left"
  );
  const press = easeOutCubic(seg(c, 0.2, 0.3)) * (1 - seg(c, 0.4, 0.5));
  const gx = url.x + url.w - url.h * 0.6;
  const gy = url.y + url.h / 2;
  circlePath(ctx, gx, gy, Math.max(0, url.h * (0.32 + 0.12 * press)));
  ctx.fillStyle = tint(palette, press * progress, 0.2 + 0.4 * press);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(gx, gy - url.h * 0.15);
  ctx.lineTo(gx, gy + url.h * 0.15);
  ctx.moveTo(gx - url.h * 0.1, gy + url.h * 0.05);
  ctx.lineTo(gx, gy + url.h * 0.16);
  ctx.lineTo(gx + url.h * 0.1, gy + url.h * 0.05);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = tint(palette, progress, 0.6 + 0.4 * progress);
  ctx.stroke();
  fillRounded(ctx, part(rect, 0.06, 0.26, 0.5, 0.2), 3, tint(palette, progress, 0.14));
  pill(ctx, rect.x + rect.w * 0.06, rect.y + rect.h * 0.56, rect.w * 0.6, rect.h * 0.06, soft);
  pill(ctx, rect.x + rect.w * 0.06, rect.y + rect.h * 0.68, rect.w * 0.4, rect.h * 0.06, faint);
  fillRounded(ctx, part(rect, 0.64, 0.26, 0.3, 0.48), 3, faint);
};

export const drawPhone = (scene: Scene, rect: Rect, c: number): void => {
  const { dc, faint, soft, ink, muted, small, surface } = scene;
  const { ctx, progress, palette } = dc;
  const radius = Math.max(0, rect.w * 0.14);
  panel(scene, rect, radius, progress);
  drawLabel(
    ctx,
    "9:41",
    rect.x + rect.w * 0.12,
    rect.y + rect.h * 0.04,
    small * 0.8,
    muted,
    "left"
  );
  const grid = part(rect, 0.08, 0.1, 0.84, 0.62);
  const cell = { w: grid.w / COLUMNS, h: grid.h / ROWS };
  const size = Math.max(0, Math.min(cell.w, cell.h) * 0.62);
  const slotX = grid.x + cell.w * (SLOT.col + 0.5);
  const slotY = grid.y + cell.h * (SLOT.row + 0.5);
  for (let index = 0; index < COLUMNS * ROWS; index += 1) {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const cx = grid.x + cell.w * (col + 0.5);
    const cy = grid.y + cell.h * (row + 0.5);
    const icon = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
    if (col === SLOT.col && row === SLOT.row) {
      ctx.setLineDash(DASH);
      outlineRect(ctx, icon, size * 0.28, soft);
      ctx.setLineDash(NO_DASH);
    } else {
      fillRounded(ctx, icon, size * 0.28, index % 3 === 0 ? soft : faint);
    }
  }
  const slide = easeOutCubic(seg(c, 0.05, 0.2)) * (1 - easeInOutCubic(seg(c, 0.3, 0.4)));
  const sheet = {
    x: rect.x + rect.w * 0.06,
    y: rect.y + rect.h * (1.02 - 0.26 * slide),
    w: rect.w * 0.88,
    h: rect.h * 0.2,
  };
  const tap = seg(c, 0.24, 0.3);
  const sheetFont = fit(11, sheet.w * 0.6, small * 0.95);
  if (slide > 0.01) {
    fillRounded(ctx, sheet, 7, surface);
    outlineRect(ctx, sheet, 7, tint(palette, slide, 0.35 + 0.55 * slide));
    const mini = Math.max(0, sheet.h * 0.46);
    const iconBox = { x: sheet.x + sheet.w * 0.08, y: sheet.y + sheet.h * 0.2, w: mini, h: mini };
    if (c < 0.3) {
      fillRounded(ctx, iconBox, mini * 0.28, tint(palette, slide, 0.5));
    }
    drawLabel(
      ctx,
      "Install app",
      iconBox.x + mini + 6,
      sheet.y + sheet.h * 0.36,
      sheetFont,
      ink,
      "left",
      true
    );
    const btn = {
      x: sheet.x + sheet.w * 0.08,
      y: sheet.y + sheet.h * 0.66,
      w: sheet.w * 0.84,
      h: sheet.h * 0.24,
    };
    fillRounded(ctx, btn, btn.h / 2, tint(palette, tap, 0.25 + 0.45 * tap));
    drawLabel(
      ctx,
      "Install",
      btn.x + btn.w / 2,
      btn.y + btn.h / 2,
      fit(7, btn.w - 8, small * 0.85),
      ink,
      "center",
      true
    );
  }
  const fly = easeInOutCubic(seg(c, 0.3, 0.55));
  const pop = easeOutBack(seg(c, 0.55, 0.65));
  if (fly > 0 && fly < 1) {
    const from = { x: sheet.x + sheet.w * 0.08 + sheet.h * 0.23, y: sheet.y + sheet.h * 0.43 };
    const p = quadPoint(
      from,
      { x: from.x + (slotX - from.x) * 0.2, y: Math.min(from.y, slotY) - rect.h * 0.15 },
      { x: slotX, y: slotY },
      fly
    );
    const s = size * (0.6 + 0.4 * fly);
    fillRounded(
      ctx,
      { x: p.x - s / 2, y: p.y - s / 2, w: s, h: s },
      s * 0.28,
      tint(palette, 1, 0.7)
    );
  } else if (c >= 0.55 && fly >= 1) {
    const s = Math.max(0, size * pop);
    fillRounded(
      ctx,
      { x: slotX - s / 2, y: slotY - s / 2, w: s, h: s },
      s * 0.28,
      tint(palette, 1, 0.7)
    );
    circlePath(ctx, slotX, slotY, Math.max(0, size * (0.5 + 0.7 * seg(c, 0.55, 0.7))));
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, 1, 0.6 * (1 - seg(c, 0.55, 0.7)));
    ctx.stroke();
  }
};
