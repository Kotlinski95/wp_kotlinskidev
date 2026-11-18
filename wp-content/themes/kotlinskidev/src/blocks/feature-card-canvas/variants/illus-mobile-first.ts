import { clamp01, easeOutBack, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { circlePath, dot, drawLabel, fillRounded, pill, roundedRectPath, tint } from "./shared";

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  soft: string;
  faint: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  small: number;
}

const DASH: number[] = [3, 3];
const NO_DASH: number[] = [];
const RIPPLE_MS = 2200;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const createScene = (dc: DrawContext): Scene => {
  const area = fitFullArea(dc.width, dc.height);
  const { palette } = dc;
  return {
    dc,
    area,
    box: (u, v, w, h) => ({
      x: area.x + u * area.w,
      y: area.y + v * area.h,
      w: w * area.w,
      h: h * area.h,
    }),
    soft: rgba(palette.muted, 0.4),
    faint: rgba(palette.muted, 0.2),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    small: Math.max(6, area.h * 0.03),
  };
};

const grown = (rect: Rect, t: number): Rect => {
  const scale = 0.7 + 0.3 * t;
  const w = rect.w * scale;
  const h = rect.h * scale;
  return { x: rect.x + (rect.w - w) / 2, y: rect.y + rect.h - h, w, h };
};

const drawGrid = (scene: Scene, body: Rect, columns: number, rows: number, t: number): void => {
  const { dc, faint, soft } = scene;
  const { ctx, palette } = dc;
  const gap = body.w * 0.035;
  const cellW = (body.w - gap * (columns - 1)) / columns;
  const cellH = (body.h - gap * (rows - 1)) / rows;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = {
        x: body.x + col * (cellW + gap),
        y: body.y + row * (cellH + gap),
        w: cellW,
        h: cellH,
      };
      const lit = seg(t, (row * columns + col) * 0.08, 0.5 + (row * columns + col) * 0.08);
      fillRounded(ctx, cell, 3, faint);
      fillRounded(ctx, { ...cell, h: cell.h * 0.5 }, 3, tint(palette, lit, 0.18 + 0.2 * lit));
      pill(ctx, cell.x + cell.w * 0.1, cell.y + cell.h * 0.64, cell.w * 0.8, cell.h * 0.08, soft);
      pill(ctx, cell.x + cell.w * 0.1, cell.y + cell.h * 0.8, cell.w * 0.5, cell.h * 0.08, faint);
    }
  }
};

const drawShell = (scene: Scene, rect: Rect, radius: number, t: number): Rect => {
  const { dc, surface, faint, soft } = scene;
  const { ctx, palette } = dc;
  fillRounded(ctx, rect, radius, surface);
  roundedRectPath(ctx, rect, radius);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, t, 0.45 + 0.5 * t);
  ctx.stroke();
  const nav = {
    x: rect.x + rect.w * 0.06,
    y: rect.y + rect.h * 0.06,
    w: rect.w * 0.88,
    h: rect.h * 0.05,
  };
  pill(ctx, nav.x, nav.y, nav.w * 0.25, nav.h, soft);
  [0.55, 0.7, 0.85].forEach((u) => {
    pill(ctx, nav.x + nav.w * u, nav.y + nav.h * 0.15, nav.w * 0.1, nav.h * 0.7, faint);
  });
  return {
    x: nav.x,
    y: nav.y + nav.h * 1.5,
    w: nav.w,
    h: rect.y + rect.h - (nav.y + nav.h * 1.5) - rect.h * 0.05,
  };
};

const drawPhone = (scene: Scene, t: number): void => {
  const { dc, box, faint, soft, ink, muted, outline, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const rect = box(0.395, 0.02, 0.21, 0.8);
  const body = drawShell(scene, rect, rect.w * 0.12, t);
  const time9 = { x: rect.x + rect.w * 0.12, y: rect.y + rect.h * 0.032 };
  drawLabel(ctx, "9:41", time9.x, time9.y, small * 0.85, ink, "left", true);
  [0.4, 0.6, 0.8, 1].forEach((v, index) => {
    const h = small * 0.9 * v;
    ctx.fillStyle = soft;
    ctx.fillRect(
      rect.x + rect.w * (0.58 + index * 0.06),
      time9.y + small * 0.4 - h,
      rect.w * 0.035,
      h
    );
  });
  fillRounded(
    ctx,
    { x: rect.x + rect.w * 0.84, y: time9.y - small * 0.28, w: rect.w * 0.1, h: small * 0.55 },
    2,
    tint(palette, t, 0.5)
  );
  const hero = { x: body.x, y: body.y, w: body.w, h: body.h * 0.2 };
  fillRounded(ctx, hero, 3, tint(palette, t, 0.2 + 0.15 * t));
  pill(
    ctx,
    hero.x + hero.w * 0.1,
    hero.y + hero.h * 0.3,
    hero.w * 0.6,
    hero.h * 0.12,
    rgba(palette.strong, 0.5)
  );
  pill(
    ctx,
    hero.x + hero.w * 0.1,
    hero.y + hero.h * 0.6,
    hero.w * 0.34,
    hero.h * 0.18,
    tint(palette, t, 0.6)
  );
  const tabH = rect.h * 0.1;
  drawGrid(
    scene,
    { x: body.x, y: hero.y + hero.h * 1.12, w: body.w, h: body.h - hero.h * 1.12 - tabH * 1.15 },
    1,
    3,
    t
  );
  const tab = {
    x: rect.x + rect.w * 0.04,
    y: rect.y + rect.h - tabH * 1.12,
    w: rect.w * 0.92,
    h: tabH,
  };
  fillRounded(ctx, tab, 5, faint);
  for (let index = 0; index < 4; index += 1) {
    const cx = tab.x + (tab.w * (index + 0.5)) / 4;
    const cy = tab.y + tab.h / 2;
    const active = index === 2;
    ctx.setLineDash(DASH);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, active ? t : 0, 0.5);
    ctx.strokeRect(cx - tab.w * 0.105, tab.y + tab.h * 0.04, tab.w * 0.21, tab.h * 0.92);
    ctx.setLineDash(NO_DASH);
    dot(ctx, cx, cy - tab.h * 0.08, tab.h * 0.17, active ? tint(palette, t) : muted);
    pill(ctx, cx - tab.w * 0.06, cy + tab.h * 0.22, tab.w * 0.12, tab.h * 0.08, soft);
  }
  const reachX = rect.x + rect.w * 0.88;
  const reachY = rect.y + rect.h * 0.96;
  const reachR = rect.w * 1.05 * easeOutCubic(seg(progress, 0.25, 0.6));
  ctx.beginPath();
  ctx.moveTo(reachX, reachY);
  ctx.arc(reachX, reachY, reachR, Math.PI, Math.PI * 1.5);
  ctx.closePath();
  ctx.fillStyle = rgba(palette.accent, 0.1 * t);
  ctx.fill();
  ctx.setLineDash(DASH);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(reachX, reachY, reachR, Math.PI, Math.PI * 1.5);
  ctx.strokeStyle = tint(palette, t, 0.2 + 0.7 * t);
  ctx.stroke();
  ctx.setLineDash(NO_DASH);
  const loop = (time % RIPPLE_MS) / RIPPLE_MS;
  const tapX = tab.x + tab.w * 0.625;
  const tapY = tab.y + tab.h * 0.5;
  dot(ctx, tapX, tapY, tab.h * 0.12 * t, rgba(palette.accentGlow, 0.7 * t));
  [loop, (loop + 0.5) % 1].forEach((ring) => {
    circlePath(ctx, tapX, tapY, tab.h * (0.12 + 0.6 * ring) * t);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, t, (1 - ring) * 0.8 * t);
    ctx.stroke();
  });
  roundedRectPath(
    ctx,
    { x: rect.x + rect.w * 0.3, y: rect.y + rect.h * 0.012, w: rect.w * 0.4, h: rect.h * 0.012 },
    2
  );
  ctx.fillStyle = outline;
  ctx.fill();
};

const drawDevice = (
  scene: Scene,
  rect: Rect,
  columns: number,
  rows: number,
  t: number,
  radius: number
): void => {
  const { dc } = scene;
  const frame = grown(rect, t);
  dc.ctx.save();
  dc.ctx.globalAlpha = 0.35 + 0.65 * t;
  const body = drawShell(scene, frame, radius, t);
  const hero = { x: body.x, y: body.y, w: body.w, h: body.h * 0.22 };
  fillRounded(dc.ctx, hero, 3, tint(dc.palette, t, 0.2 + 0.15 * t));
  pill(
    dc.ctx,
    hero.x + hero.w * 0.08,
    hero.y + hero.h * 0.36,
    hero.w * 0.4,
    hero.h * 0.14,
    rgba(dc.palette.strong, 0.5)
  );
  drawGrid(
    scene,
    { x: body.x, y: hero.y + hero.h * 1.12, w: body.w, h: body.h - hero.h * 1.12 },
    columns,
    rows,
    t
  );
  dc.ctx.restore();
};

const drawLabels = (scene: Scene): void => {
  const { dc, box, ink, muted, faint, surface, small, area } = scene;
  const { ctx, progress, palette } = dc;
  const stops: ReadonlyArray<readonly [string, number, number]> = [
    ["375px", 0.5, 0],
    ["768px", 0.195, 0.3],
    ["1280px", 0.82, 0.62],
  ];
  stops.forEach(([label, u, from]) => {
    const on = seg(progress, from, from + 0.25);
    const row = box(0, 0.855, 1, 0.05);
    drawLabel(
      ctx,
      label,
      row.x + row.w * u,
      row.y + row.h / 2,
      small,
      on > 0.5 ? ink : muted,
      "center",
      on > 0.5
    );
  });
  const y = box(0, 0.955, 1, 0).y;
  const startX = area.x + area.w * 0.12;
  const endX = area.x + area.w * 0.9;
  const reach = easeOutBack(seg(progress, 0.1, 0.9), 1);
  ctx.lineCap = "round";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX, y);
  ctx.strokeStyle = faint;
  ctx.stroke();
  const tip = startX + (endX - startX) * Math.min(1, reach);
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(tip, y);
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip - small * 0.7, y - small * 0.6);
  ctx.lineTo(tip, y);
  ctx.lineTo(tip - small * 0.7, y + small * 0.6);
  ctx.stroke();
  const labelW = small * 6.4;
  pill(ctx, area.x + area.w / 2 - labelW / 2, y - small * 0.8, labelW, small * 1.6, surface);
  drawLabel(
    ctx,
    "min-width",
    area.x + area.w / 2,
    y,
    small,
    tint(palette, progress, 0.6 + 0.4 * progress),
    "center",
    true
  );
};

export const drawIllusMobileFirst = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const { box } = scene;
  const phoneT = easeOutCubic(seg(dc.progress, 0, 0.35));
  const tabletT = easeOutCubic(seg(dc.progress, 0.3, 0.65));
  const desktopT = easeOutCubic(seg(dc.progress, 0.6, 0.9));
  drawDevice(scene, box(0.03, 0.28, 0.33, 0.54), 2, 3, tabletT, 8);
  drawDevice(scene, box(0.65, 0.34, 0.34, 0.48), 3, 2, desktopT, 5);
  drawPhone(scene, phoneT);
  drawLabels(scene);
};
