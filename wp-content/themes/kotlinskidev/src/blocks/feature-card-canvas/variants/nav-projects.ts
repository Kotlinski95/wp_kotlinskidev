import { clamp01, easeInOutCubic, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { dot, drawLabel, fillRounded, pill, roundedRectPath, tint } from "./shared";

interface Scene {
  dc: DrawContext;
  area: Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  font: number;
}

const TITLES = ["Brand site", "Online store", "Analytics app"] as const;
const METRICS: ReadonlyArray<readonly [string, string]> = [
  ["+31% leads", "-52% LCP"],
  ["+82% conversion", "-46% load time"],
  ["4x faster", "+19% retention"],
];
const TAGS = ["Next.js", "React", "Shopify"] as const;
const SLIDE_MS = 3200;
const SLOT_COUNT = 3;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const createScene = (dc: DrawContext): Scene => {
  const full = fitFullArea(dc.width, dc.height);
  const inset = Math.round(Math.min(dc.width, dc.height) * 0.05);
  const area: Rect = {
    x: full.x + inset,
    y: full.y + inset,
    w: full.w - inset * 2,
    h: full.h - inset,
  };
  const { palette } = dc;
  return {
    dc,
    area,
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    font: Math.max(7, area.h * 0.04),
  };
};

const drawHeroSite = (scene: Scene, r: Rect, lit: number): void => {
  const { dc, faint, soft } = scene;
  const { ctx, palette } = dc;
  pill(ctx, r.x + r.w * 0.06, r.y + r.h * 0.06, r.w * 0.2, r.h * 0.05, soft);
  [0.58, 0.7, 0.82].forEach((u) =>
    pill(ctx, r.x + r.w * u, r.y + r.h * 0.065, r.w * 0.09, r.h * 0.04, faint)
  );
  fillRounded(
    ctx,
    { x: r.x + r.w * 0.06, y: r.y + r.h * 0.17, w: r.w * 0.88, h: r.h * 0.38 },
    3,
    tint(palette, lit, 0.16 + 0.14 * lit)
  );
  pill(ctx, r.x + r.w * 0.12, r.y + r.h * 0.27, r.w * 0.45, r.h * 0.06, rgba(palette.strong, 0.45));
  pill(ctx, r.x + r.w * 0.12, r.y + r.h * 0.37, r.w * 0.3, r.h * 0.04, soft);
  pill(ctx, r.x + r.w * 0.12, r.y + r.h * 0.46, r.w * 0.16, r.h * 0.05, tint(palette, lit, 0.6));
  [0, 1, 2].forEach((i) =>
    fillRounded(
      ctx,
      { x: r.x + r.w * (0.06 + i * 0.3), y: r.y + r.h * 0.63, w: r.w * 0.28, h: r.h * 0.3 },
      3,
      faint
    )
  );
};

const drawProductGrid = (scene: Scene, r: Rect, lit: number): void => {
  const { dc, faint, soft } = scene;
  const { ctx, palette } = dc;
  pill(ctx, r.x + r.w * 0.06, r.y + r.h * 0.06, r.w * 0.2, r.h * 0.05, soft);
  pill(ctx, r.x + r.w * 0.5, r.y + r.h * 0.06, r.w * 0.3, r.h * 0.05, faint);
  dot(ctx, r.x + r.w * 0.9, r.y + r.h * 0.085, r.h * 0.03, tint(palette, lit, 0.5));
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cell = {
        x: r.x + r.w * (0.06 + col * 0.31),
        y: r.y + r.h * (0.17 + row * 0.41),
        w: r.w * 0.28,
        h: r.h * 0.38,
      };
      fillRounded(ctx, cell, 3, faint);
      fillRounded(ctx, { ...cell, h: cell.h * 0.62 }, 3, tint(palette, lit, 0.12 + 0.12 * lit));
      pill(ctx, cell.x + cell.w * 0.1, cell.y + cell.h * 0.72, cell.w * 0.6, cell.h * 0.07, soft);
      pill(
        ctx,
        cell.x + cell.w * 0.1,
        cell.y + cell.h * 0.86,
        cell.w * 0.3,
        cell.h * 0.07,
        tint(palette, lit, 0.5)
      );
    }
  }
};

const drawDashboard = (scene: Scene, r: Rect, lit: number): void => {
  const { dc, faint, soft } = scene;
  const { ctx, palette } = dc;
  fillRounded(
    ctx,
    { x: r.x + r.w * 0.04, y: r.y + r.h * 0.06, w: r.w * 0.18, h: r.h * 0.88 },
    3,
    faint
  );
  [0.14, 0.24, 0.34, 0.44].forEach((v) =>
    pill(ctx, r.x + r.w * 0.07, r.y + r.h * v, r.w * 0.12, r.h * 0.04, soft)
  );
  [0, 1, 2].forEach((i) => {
    const card = {
      x: r.x + r.w * (0.26 + i * 0.25),
      y: r.y + r.h * 0.08,
      w: r.w * 0.23,
      h: r.h * 0.18,
    };
    fillRounded(ctx, card, 3, faint);
    pill(
      ctx,
      card.x + card.w * 0.12,
      card.y + card.h * 0.55,
      card.w * 0.5,
      card.h * 0.18,
      tint(palette, lit, 0.4 + 0.3 * lit)
    );
  });
  const chart = { x: r.x + r.w * 0.26, y: r.y + r.h * 0.34, w: r.w * 0.7, h: r.h * 0.58 };
  fillRounded(ctx, chart, 3, faint);
  [0.3, 0.5, 0.42, 0.7, 0.62, 0.88].forEach((v, i) => {
    const h = chart.h * 0.75 * v * (0.4 + 0.6 * lit);
    fillRounded(
      ctx,
      {
        x: chart.x + chart.w * (0.08 + i * 0.15),
        y: chart.y + chart.h * 0.88 - h,
        w: chart.w * 0.09,
        h,
      },
      2,
      i === 5 ? tint(palette, lit, 0.7) : soft
    );
  });
};

const THUMBS = [drawHeroSite, drawProductGrid, drawDashboard] as const;

const drawCursor = (scene: Scene, x: number, y: number, t: number): void => {
  const { dc, surface, font } = scene;
  const { ctx, time, palette } = dc;
  const s = font * 1.4;
  const bob = Math.sin(time / 500) * 2 * t;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.globalAlpha = t;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(s * 0.28, s * 0.74);
  ctx.lineTo(s * 0.5, s * 1.15);
  ctx.lineTo(s * 0.66, s * 1.07);
  ctx.lineTo(s * 0.45, s * 0.68);
  ctx.lineTo(s * 0.8, s * 0.66);
  ctx.closePath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, t);
  ctx.stroke();
  ctx.restore();
};

const drawWindow = (scene: Scene): number => {
  const { dc, area, faint, soft, surface, outline, muted } = scene;
  const { ctx, progress, time, palette } = dc;
  const win = { x: area.x, y: area.y, w: area.w, h: area.h * 0.6 };
  fillRounded(ctx, win, 8, surface);
  roundedRectPath(ctx, win, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  const barH = win.h * 0.11;
  [0, 1, 2].forEach((i) =>
    dot(
      ctx,
      win.x + win.w * (0.04 + i * 0.03),
      win.y + barH / 2,
      barH * 0.16,
      i === 0 ? tint(palette, progress, 0.5) : soft
    )
  );
  pill(ctx, win.x + win.w * 0.2, win.y + barH * 0.2, win.w * 0.6, barH * 0.6, faint);
  drawLabel(
    ctx,
    "kotlinskidev.com/work",
    win.x + win.w * 0.5,
    win.y + barH / 2,
    barH * 0.4,
    muted,
    "center"
  );
  const stage = { x: win.x, y: win.y + barH * 1.1, w: win.w, h: win.h - barH * 1.1 };
  const loop = progress >= 1 ? time / SLIDE_MS : 0;
  const slide = Math.floor(loop) + easeInOutCubic(seg(loop % 1, 0.7, 1));
  const order = [0, 1, 2].map((index) => {
    const raw = index - (1 + slide);
    const d = raw - SLOT_COUNT * Math.round(raw / SLOT_COUNT);
    return { index, d };
  });
  order.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  const reveal = easeOutCubic(seg(progress, 0, 0.5));
  const hover = easeOutCubic(seg(progress, 0.55, 0.85));
  ctx.save();
  roundedRectPath(ctx, win, 8);
  ctx.clip();
  order.forEach(({ index, d }) => {
    const mag = Math.abs(d);
    const scale = 1 - 0.3 * Math.min(1, mag);
    const h = stage.h * 0.9 * scale;
    const w = stage.w * 0.5 * scale;
    const rect = {
      x: stage.x + stage.w * (0.5 + d * 0.36) - w / 2,
      y: stage.y + (stage.h - h) / 2,
      w,
      h,
    };
    const focus = clamp01(1 - mag);
    ctx.globalAlpha = reveal * (1 - seg(mag, 1, 1.5)) * (0.55 + 0.45 * focus);
    fillRounded(ctx, rect, 5, surface);
    THUMBS[index](scene, rect, focus * hover);
    roundedRectPath(ctx, rect, 5);
    ctx.lineWidth = 1 + focus;
    ctx.strokeStyle = tint(palette, focus * hover, 0.35 + 0.65 * focus * hover);
    ctx.stroke();
  });
  ctx.restore();
  drawCursor(scene, stage.x + stage.w * 0.58, stage.y + stage.h * 0.62, hover);
  return Math.round(1 + slide + SLOT_COUNT * 4) % SLOT_COUNT;
};

const drawCaption = (scene: Scene, active: number): void => {
  const { dc, area, ink, muted, faint, font } = scene;
  const { ctx, progress, palette } = dc;
  const t = easeOutCubic(seg(progress, 0.3, 0.7));
  const y = area.y + area.h * 0.68;
  ctx.globalAlpha = 0.4 + 0.6 * t;
  drawLabel(ctx, TITLES[active], area.x + 2, y, font * 1.15, ink, "left", true);
  drawLabel(
    ctx,
    "case study",
    area.x + 2 + TITLES[active].length * font * 0.72 + 8,
    y,
    font * 0.85,
    muted
  );
  ctx.globalAlpha = 1;
  TITLES.forEach((_, index) => {
    const on = index === active ? t : 0;
    dot(
      ctx,
      area.x + area.w - font * (1.4 + (2 - index) * 1.1),
      y,
      font * (0.28 + 0.12 * on),
      index === active ? tint(palette, on) : faint
    );
  });
  const chipY = area.y + area.h * 0.76;
  let cursor = area.x + 2;
  METRICS[active].forEach((label, index) => {
    const m = easeOutCubic(seg(progress, 0.5 + index * 0.12, 0.85 + index * 0.12));
    const w = label.length * font * 0.62 + 14;
    pill(ctx, cursor, chipY, w, font * 2, tint(palette, m, 0.12 + 0.16 * m));
    roundedRectPath(ctx, { x: cursor, y: chipY, w, h: font * 2 }, font);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, m, 0.3 + 0.6 * m);
    ctx.stroke();
    drawLabel(ctx, label, cursor + w / 2, chipY + font, font * 0.95, ink, "center", true);
    cursor += w + 6;
  });
  const tagY = area.y + area.h * 0.89;
  cursor = area.x + 2;
  TAGS.forEach((tag, index) => {
    const w = tag.length * font * 0.62 + 12;
    const on = index === active ? t : 0;
    pill(ctx, cursor, tagY, w, font * 1.8, tint(palette, on, 0.1 + 0.14 * on));
    drawLabel(
      ctx,
      tag,
      cursor + w / 2,
      tagY + font * 0.9,
      font * 0.9,
      on > 0.5 ? ink : muted,
      "center"
    );
    cursor += w + 5;
  });
};

export const drawNavProjects = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const active = drawWindow(scene);
  drawCaption(scene, active);
};
