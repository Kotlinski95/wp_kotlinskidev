import { clamp01, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { circlePath, dot, drawLabel, fillRounded, pill, roundedRectPath, tint } from "./shared";

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  text: number;
  small: number;
}

type Glyph = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  style: string
) => void;

const CHAR_WIDTH = 0.62;
const LOOP_MS = 2000;
const SCORES: ReadonlyArray<readonly [string, number]> = [
  ["Perf", 58],
  ["A11y", 71],
  ["Best", 79],
  ["SEO", 64],
];
const TRAFFIC = [0.08, 0.14, 0.12, 0.25, 0.34, 0.31, 0.52, 0.7, 0.93] as const;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const fit = (chars: number, room: number, base: number): number =>
  Math.max(6, Math.min(base, room / (chars * CHAR_WIDTH)));

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
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    text: Math.max(7, area.h * 0.036),
    small: Math.max(6, area.h * 0.029),
  };
};

const stroke = (ctx: CanvasRenderingContext2D, style: string, width = 1.5): void => {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = style;
  ctx.stroke();
};

const speed: Glyph = (ctx, cx, cy, r, style) => {
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.2, cy - r);
  ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.2, cy + r);
  ctx.lineTo(cx + r * 0.55, cy - r * 0.2);
  ctx.lineTo(cx + r * 0.05, cy - r * 0.2);
  ctx.closePath();
  stroke(ctx, style);
};

const responsive: Glyph = (ctx, cx, cy, r, style) => {
  roundedRectPath(ctx, { x: cx - r, y: cy - r * 0.7, w: r * 1.5, h: r * 1.1 }, 2);
  stroke(ctx, style);
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.2, cy + r * 0.62);
  ctx.lineTo(cx + r * 0.7, cy + r * 0.62);
  stroke(ctx, style);
  roundedRectPath(ctx, { x: cx + r * 0.25, y: cy - r * 0.2, w: r * 0.7, h: r * 1.1 }, 2);
  stroke(ctx, style);
};

const access: Glyph = (ctx, cx, cy, r, style) => {
  roundedRectPath(ctx, { x: cx - r, y: cy - r * 0.7, w: r * 2, h: r * 1.4 }, 3);
  stroke(ctx, style);
  drawLabel(ctx, "AA", cx, cy, r * 1.0, style, "center", true);
};

const search: Glyph = (ctx, cx, cy, r, style) => {
  circlePath(ctx, cx - r * 0.15, cy - r * 0.15, r * 0.65);
  stroke(ctx, style);
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.35, cy + r * 0.35);
  ctx.lineTo(cx + r * 0.95, cy + r * 0.95);
  stroke(ctx, style, 2);
};

const IMPROVEMENTS: ReadonlyArray<readonly [string, Glyph, number, number]> = [
  ["Speed", speed, 48, 91],
  ["Responsive", responsive, 63, 94],
  ["Accessibility", access, 60, 97],
  ["SEO", search, 45, 92],
];

const drawRows = (scene: Scene): void => {
  const { dc, box, surface, faint, soft, ink, muted, text, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const active = Math.floor(time / LOOP_MS) % IMPROVEMENTS.length;
  IMPROVEMENTS.forEach(([title, glyph, before, after], index) => {
    const row = box(0, index * 0.255, 0.48, 0.235);
    const e = easeOutCubic(seg(progress, 0.1 + index * 0.12, 0.6 + index * 0.12));
    const pulse =
      progress >= 1 && index === active
        ? 0.5 + 0.5 * Math.sin(((time % LOOP_MS) / LOOP_MS) * Math.PI)
        : 0;
    fillRounded(ctx, row, 7, surface);
    roundedRectPath(ctx, row, 7);
    ctx.lineWidth = 1 + pulse * 0.8;
    ctx.strokeStyle = tint(palette, Math.max(e, pulse), 0.35 + 0.55 * e);
    ctx.stroke();
    const gr = row.h * 0.17;
    const gx = row.x + row.h * 0.32;
    const gy = row.y + row.h * 0.34;
    circlePath(ctx, gx, gy, gr * 1.5);
    ctx.fillStyle = tint(palette, e, 0.1 + 0.12 * e);
    ctx.fill();
    glyph(ctx, gx, gy, gr, tint(palette, e, 0.6 + 0.4 * e));
    const tx = gx + gr * 2.1;
    const chipText = `+${Math.round((after - before) * e)} pts`;
    const chipW = chipText.length * small * CHAR_WIDTH + 12;
    const titleSize = fit(title.length, row.w - (tx - row.x) - chipW - 16, text);
    drawLabel(ctx, title, tx, gy, titleSize, ink, "left", true);
    const chip = { x: row.x + row.w - chipW - 8, y: gy - small, w: chipW, h: small * 2 };
    pill(ctx, chip.x, chip.y, chip.w, chip.h, tint(palette, e, 0.12 + 0.18 * e));
    drawLabel(ctx, chipText, chip.x + chip.w / 2, gy, small, ink, "center", true);
    const trackX = row.x + row.w * 0.06;
    const trackW = row.w * 0.88;
    const trackY = row.y + row.h * 0.66;
    const th = row.h * 0.1;
    pill(ctx, trackX, trackY, trackW, th, faint);
    const value = before + (after - before) * e;
    pill(
      ctx,
      trackX,
      trackY,
      Math.max(th, (trackW * value) / 100),
      th,
      tint(palette, e, 0.4 + 0.6 * e)
    );
    ctx.fillStyle = soft;
    ctx.fillRect(trackX + (trackW * before) / 100 - 1, trackY - th * 0.4, 2, th * 1.8);
    drawLabel(ctx, `${before} > ${after}`, trackX, row.y + row.h * 0.9, small * 0.9, muted, "left");
    drawLabel(
      ctx,
      `${Math.round(value)}/100`,
      trackX + trackW,
      row.y + row.h * 0.9,
      small * 0.9,
      ink,
      "right",
      true
    );
  });
};

const drawScores = (scene: Scene): void => {
  const { dc, box, muted, small, text } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = box(0.52, 0, 0.48, 0.27);
  const cell = zone.w / SCORES.length;
  const r = Math.min(cell * 0.34, zone.h * 0.34);
  SCORES.forEach(([name, start], index) => {
    const e = easeOutCubic(seg(progress, 0.15 + index * 0.1, 0.7 + index * 0.1));
    const value = Math.round(start + (100 - start) * e);
    const cx = zone.x + cell * (index + 0.5);
    const cy = zone.y + zone.h * 0.4;
    ctx.lineWidth = Math.max(2, r * 0.22);
    ctx.lineCap = "round";
    circlePath(ctx, cx, cy, r);
    ctx.strokeStyle = rgba(palette.line, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * value) / 100);
    ctx.strokeStyle = tint(palette, e);
    ctx.stroke();
    drawLabel(
      ctx,
      String(value),
      cx,
      cy,
      fit(3, r * 1.5, text * 0.95),
      tint(palette, e, 0.75 + 0.25 * e),
      "center",
      true
    );
    drawLabel(ctx, name, cx, zone.y + zone.h * 0.92, fit(4, cell - 4, small), muted, "center");
    if (value >= 100 && progress >= 1) {
      circlePath(ctx, cx, cy, r * (1.15 + 0.2 * ((time / 1500 + index * 0.2) % 1)));
      ctx.lineWidth = 1;
      ctx.strokeStyle = tint(palette, 1, 0.35 * (1 - ((time / 1500 + index * 0.2) % 1)));
      ctx.stroke();
    }
  });
};

const drawLoad = (scene: Scene): void => {
  const { dc, box, faint, soft, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const zone = box(0.52, 0.31, 0.48, 0.15);
  const e = easeOutCubic(seg(progress, 0.3, 0.85));
  const label = zone.w * 0.2;
  const trackW = zone.w - label - small * 3.6;
  const bars: ReadonlyArray<readonly [string, string, number, string]> = [
    ["before", "4.2s", 1, soft],
    [
      "after",
      `${(4.2 - 3.1 * e).toFixed(1)}s`,
      (4.2 - 3.1 * e) / 4.2,
      tint(palette, e, 0.5 + 0.5 * e),
    ],
  ];
  bars.forEach(([name, value, fill, style], index) => {
    const y = zone.y + zone.h * (0.25 + index * 0.5);
    drawLabel(ctx, name, zone.x, y, small, muted, "left");
    pill(ctx, zone.x + label, y - small * 0.4, trackW, small * 0.8, faint);
    pill(
      ctx,
      zone.x + label,
      y - small * 0.4,
      Math.max(small * 0.8, trackW * fill),
      small * 0.8,
      style
    );
    drawLabel(ctx, value, zone.x + zone.w, y, small, ink, "right", true);
  });
};

const drawSerp = (scene: Scene): void => {
  const { dc, box, surface, faint, soft, ink, muted, small, text } = scene;
  const { ctx, progress, time, palette } = dc;
  const card = box(0.52, 0.5, 0.48, 0.22);
  const e = easeOutCubic(seg(progress, 0.35, 0.9));
  fillRounded(ctx, card, 7, surface);
  roundedRectPath(ctx, card, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, e, 0.35 + 0.55 * e);
  ctx.stroke();
  const rank = 8 - Math.round(7 * e);
  const chipW = text * 3.4;
  const chip = {
    x: card.x + card.w - chipW - 8,
    y: card.y + card.h * 0.2,
    w: chipW,
    h: text * 1.7,
  };
  fillRounded(ctx, chip, chip.h / 2, tint(palette, e, 0.16 + 0.24 * e));
  drawLabel(
    ctx,
    `#${rank}`,
    chip.x + chip.w * 0.62,
    chip.y + chip.h / 2,
    text,
    ink,
    "center",
    true
  );
  const bob = Math.sin(time / 350) * 1.5 * progress;
  const ax = chip.x + chip.w * 0.22;
  const ay = chip.y + chip.h / 2 + bob;
  ctx.beginPath();
  ctx.moveTo(ax, ay + text * 0.4);
  ctx.lineTo(ax, ay - text * 0.4);
  ctx.moveTo(ax - text * 0.3, ay - text * 0.1);
  ctx.lineTo(ax, ay - text * 0.4);
  ctx.lineTo(ax + text * 0.3, ay - text * 0.1);
  stroke(ctx, tint(palette, e), 1.6);
  const left = card.x + card.w * 0.06;
  const textW = chip.x - left - 8;
  pill(ctx, left, card.y + card.h * 0.18, textW * 0.5, small * 0.7, soft);
  pill(
    ctx,
    left,
    card.y + card.h * 0.38,
    textW * 0.9,
    small * 0.9,
    tint(palette, e, 0.4 + 0.3 * e)
  );
  pill(ctx, left, card.y + card.h * 0.6, textW, small * 0.6, faint);
  pill(ctx, left, card.y + card.h * 0.74, textW * 0.7, small * 0.6, faint);
  drawLabel(
    ctx,
    "was #8",
    chip.x + chip.w / 2,
    chip.y + chip.h + small * 1.1,
    small * 0.9,
    muted,
    "center"
  );
};

const drawTraffic = (scene: Scene): void => {
  const { dc, box, surface, outline, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const card = box(0.52, 0.76, 0.48, 0.24);
  fillRounded(ctx, card, 7, surface);
  roundedRectPath(ctx, card, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  const reveal = easeOutCubic(seg(progress, 0.4, 0.95));
  drawLabel(
    ctx,
    "Organic traffic",
    card.x + card.w * 0.05,
    card.y + card.h * 0.17,
    fit(15, card.w * 0.6, small),
    muted,
    "left"
  );
  drawLabel(
    ctx,
    `+${Math.round(184 * reveal)}%`,
    card.x + card.w * 0.95,
    card.y + card.h * 0.17,
    small,
    ink,
    "right",
    true
  );
  const plot = {
    x: card.x + card.w * 0.05,
    y: card.y + card.h * 0.3,
    w: card.w * 0.9,
    h: card.h * 0.58,
  };
  const points = TRAFFIC.map((value, index) => ({
    x: plot.x + (plot.w * index) / (TRAFFIC.length - 1),
    y: plot.y + plot.h * (1 - value),
  }));
  const visible = reveal * (points.length - 1);
  const last = Math.min(points.length - 1, Math.floor(visible));
  const part = clamp01(visible - last);
  const next = points[Math.min(points.length - 1, last + 1)];
  const head = {
    x: points[last].x + (next.x - points[last].x) * part,
    y: points[last].y + (next.y - points[last].y) * part,
  };
  ctx.beginPath();
  ctx.moveTo(points[0].x, plot.y + plot.h);
  for (let index = 0; index <= last; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.lineTo(head.x, head.y);
  ctx.lineTo(head.x, plot.y + plot.h);
  ctx.closePath();
  ctx.fillStyle = rgba(palette.accent, 0.14 * reveal);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index <= last; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.lineTo(head.x, head.y);
  stroke(ctx, tint(palette, reveal), 2);
  const ping = ((time / 1400) % 1) * progress;
  circlePath(ctx, head.x, head.y, small * (0.5 + 1.2 * ping));
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, reveal, 0.5 * (1 - ping) * reveal);
  ctx.stroke();
  dot(ctx, head.x, head.y, small * 0.5, tint(palette, reveal));
};

export const drawIllusSeoGrowth = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawRows(scene);
  drawScores(scene);
  drawLoad(scene);
  drawSerp(scene);
  drawTraffic(scene);
};
