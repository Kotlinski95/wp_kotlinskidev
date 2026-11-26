import { clamp01, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import {
  circlePath,
  dot,
  drawLabel,
  fillRounded,
  pill,
  roundedRectPath,
  strokeTick,
  tint,
} from "./shared";

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  soft: string;
  faint: string;
  strong: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  text: number;
  small: number;
}

const KPIS: ReadonlyArray<readonly [string, string, boolean]> = [
  ["LCP", "-38%", false],
  ["JS", "-310 KB", false],
  ["CLS", "0.04", true],
];
const FINDINGS: ReadonlyArray<readonly [string, string]> = [
  ["High", "Render-blocking JS"],
  ["Med", "Image formats"],
  ["Low", "Unused CSS"],
];
const STEPS = ["Audit", "Report", "Fix", "Verify"] as const;
const BARS = [1, 0.86, 0.7, 0.52, 0.34] as const;
const TREND = [0.8, 0.7, 0.74, 0.5, 0.36, 0.2] as const;
const PULSE_MS = 3200;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const createScene = (dc: DrawContext): Scene => {
  const { width, height, palette } = dc;
  const area = fitFullArea(width, height);
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
    strong: rgba(palette.strong, 0.5),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    text: Math.max(7, area.h * 0.034),
    small: Math.max(6, area.h * 0.028),
  };
};

const triangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  up: boolean,
  style: string
): void => {
  const dir = up ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x - r, y - dir * r * 0.6);
  ctx.lineTo(x + r, y - dir * r * 0.6);
  ctx.lineTo(x, y + dir * r * 0.8);
  ctx.closePath();
  ctx.fillStyle = style;
  ctx.fill();
};

const drawPages = (scene: Scene): void => {
  const { dc, box, surface, outline, faint, soft, strong, ink, text, small, area } = scene;
  const { ctx, progress, time, palette } = dc;
  const lift = easeOutCubic(seg(progress, 0, 0.3));
  [2, 1].forEach((depth) => {
    const back = box(0.012 * depth * lift, 0.012 * (3 - depth) - 0.012 * depth * lift, 0.32, 0.78);
    back.x += 0.02 * area.w * (2 - depth) * lift;
    fillRounded(ctx, back, 6, surface);
    roundedRectPath(ctx, back, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = outline;
    ctx.stroke();
  });
  const page = box(0.035 * lift, 0.035, 0.32, 0.78);
  fillRounded(ctx, page, 6, surface);
  roundedRectPath(ctx, page, 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  const pad = page.w * 0.07;
  const barH = page.h * 0.1;
  fillRounded(ctx, { x: page.x + pad, y: page.y + pad, w: page.w - pad * 2, h: barH }, 4, faint);
  drawLabel(
    ctx,
    "Audit report",
    page.x + pad * 1.6,
    page.y + pad + barH / 2,
    text,
    ink,
    "left",
    true
  );
  const chipW = small * 5.2;
  const chipH = small * 1.7;
  pill(ctx, page.x + pad, page.y + pad * 1.5 + barH, chipW, chipH, faint);
  drawLabel(
    ctx,
    "Q4 2026",
    page.x + pad + chipW / 2,
    page.y + pad * 1.5 + barH + chipH / 2,
    small * 0.9,
    ink,
    "center"
  );
  const badgeW = small * 3.2;
  const badge = {
    x: page.x + page.w - pad - badgeW,
    y: page.y + pad * 1.5 + barH,
    w: badgeW,
    h: chipH,
  };
  fillRounded(ctx, badge, 3, tint(palette, progress, 0.25 + 0.25 * progress));
  drawLabel(
    ctx,
    "PDF",
    badge.x + badge.w / 2,
    badge.y + badge.h / 2,
    small * 0.9,
    ink,
    "center",
    true
  );

  const score = Math.round(52 + 44 * easeOutCubic(seg(progress, 0.05, 0.6)));
  const scoreEase = easeOutCubic(seg(progress, 0.05, 0.6));
  const ringR = page.w * 0.2;
  const ringX = page.x + page.w * 0.34;
  const ringY = page.y + page.h * 0.42;
  ctx.lineCap = "round";
  ctx.lineWidth = ringR * 0.24;
  circlePath(ctx, ringX, ringY, ringR);
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
  ctx.strokeStyle = tint(palette, scoreEase);
  ctx.stroke();
  drawLabel(
    ctx,
    String(score),
    ringX,
    ringY,
    ringR * 0.8,
    tint(palette, scoreEase, 0.8),
    "center",
    true
  );
  const side = page.x + page.w * 0.64;
  [0.34, 0.42, 0.5].forEach((v, index) => {
    pill(ctx, side, page.y + page.h * v, page.w * (0.28 - index * 0.04), page.h * 0.03, soft);
  });
  for (let index = 0; index < 5; index += 1) {
    const w = page.w * (0.86 - (index % 3) * 0.2);
    pill(ctx, page.x + pad, page.y + page.h * (0.64 + index * 0.062), w, page.h * 0.028, faint);
  }
  const sealX = page.x + page.w * 0.82;
  const sealY = page.y + page.h * 0.93;
  const wobble = Math.sin(time / 900) * progress * 0.04;
  circlePath(ctx, sealX, sealY - page.h * wobble, page.w * 0.07);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, progress, 0.4 + 0.6 * progress);
  ctx.stroke();
  ctx.strokeStyle = strong;
  ctx.lineWidth = 1.4;
  strokeTick(ctx, sealX, sealY - page.h * wobble, page.w * 0.06, seg(progress, 0.8, 1));
};

const drawKpis = (scene: Scene): void => {
  const { dc, box, surface, ink, muted, text, small } = scene;
  const { ctx, progress, palette } = dc;
  KPIS.forEach(([name, value, flat], index) => {
    const t = easeOutCubic(seg(progress, 0.2 + index * 0.1, 0.5 + index * 0.1));
    const card = box(0.4 + index * 0.2, 0, 0.19, 0.2);
    fillRounded(ctx, card, 5, surface);
    roundedRectPath(ctx, card, 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, t, 0.4 + 0.4 * t);
    ctx.stroke();
    drawLabel(ctx, name, card.x + card.w * 0.1, card.y + card.h * 0.25, small, muted);
    drawLabel(ctx, value, card.x + card.w * 0.1, card.y + card.h * 0.62, text, ink, "left", true);
    if (!flat) {
      triangle(
        ctx,
        card.x + card.w * 0.86,
        card.y + card.h * 0.28,
        small * 0.5,
        false,
        tint(palette, t)
      );
    } else {
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = tint(palette, t);
      strokeTick(ctx, card.x + card.w * 0.84, card.y + card.h * 0.28, small * 0.6, t);
    }
    const spark = card.y + card.h * 0.86;
    ctx.beginPath();
    ctx.moveTo(card.x + card.w * 0.1, spark - card.h * 0.04);
    ctx.lineTo(card.x + card.w * 0.4, spark - card.h * 0.08 * t);
    ctx.lineTo(card.x + card.w * 0.64, spark);
    ctx.lineTo(card.x + card.w * 0.9, spark + card.h * 0.04 * t);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, t, 0.6);
    ctx.stroke();
  });
};

const drawCharts = (scene: Scene): void => {
  const { dc, box, surface, outline, faint, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const panel = box(0.4, 0.23, 0.6, 0.28);
  fillRounded(ctx, panel, 5, surface);
  roundedRectPath(ctx, panel, 5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  const baseY = panel.y + panel.h * 0.82;
  const barW = panel.w * 0.07;
  BARS.forEach((value, index) => {
    const grow = easeOutCubic(seg(progress, 0.3 + index * 0.06, 0.6 + index * 0.06));
    const h = panel.h * 0.56 * (1 - (1 - value) * grow);
    const x = panel.x + panel.w * 0.07 + index * barW * 1.45;
    fillRounded(
      ctx,
      { x, y: baseY - h, w: barW, h },
      2,
      index === BARS.length - 1 ? tint(palette, grow, 0.35 + 0.55 * grow) : faint
    );
  });
  ctx.beginPath();
  ctx.moveTo(panel.x + panel.w * 0.05, baseY);
  ctx.lineTo(panel.x + panel.w * 0.55, baseY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  drawLabel(ctx, "load time", panel.x + panel.w * 0.07, panel.y + panel.h * 0.12, small, muted);
  const trendX = panel.x + panel.w * 0.62;
  const trendW = panel.w * 0.32;
  const reveal = easeOutCubic(seg(progress, 0.35, 0.8));
  const points = TREND.map((value, index) => ({
    x: trendX + (trendW * index) / (TREND.length - 1),
    y: panel.y + panel.h * (0.2 + 0.6 * value),
  }));
  const visible = reveal * (points.length - 1);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index > visible + 1) {
      return;
    }
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    const prev = points[index - 1];
    const part = clamp01(visible - (index - 1));
    ctx.lineTo(prev.x + (point.x - prev.x) * part, prev.y + (point.y - prev.y) * part);
  });
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, reveal);
  ctx.stroke();
  const head = Math.min(points.length - 1, Math.floor(visible));
  const glow = 1 + Math.sin(time / 500) * 0.25 * progress;
  dot(ctx, points[head].x, points[head].y, small * 0.4 * glow, tint(palette, reveal));
  drawLabel(ctx, "trend", trendX, panel.y + panel.h * 0.12, small, muted);
};

const drawFindings = (scene: Scene): void => {
  const { dc, box, surface, faint, ink, text, small } = scene;
  const { ctx, progress, palette } = dc;
  FINDINGS.forEach(([level, title], index) => {
    const done = seg(progress, 0.45 + index * 0.13, 0.6 + index * 0.13);
    const row = box(0.4, 0.54 + index * 0.095, 0.6, 0.085);
    fillRounded(ctx, row, 4, surface);
    roundedRectPath(ctx, row, 4);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, done, 0.35 + 0.45 * done);
    ctx.stroke();
    const tagW = small * 3.4;
    pill(
      ctx,
      row.x + row.w * 0.03,
      row.y + row.h * 0.2,
      tagW,
      row.h * 0.6,
      index === 0 ? tint(palette, done, 0.3) : faint
    );
    drawLabel(
      ctx,
      level,
      row.x + row.w * 0.03 + tagW / 2,
      row.y + row.h / 2,
      small * 0.9,
      ink,
      "center",
      true
    );
    drawLabel(ctx, title, row.x + row.w * 0.03 + tagW + 8, row.y + row.h / 2, text, ink);
    const cx = row.x + row.w - row.h * 0.6;
    const cy = row.y + row.h / 2;
    dot(ctx, cx, cy, row.h * 0.3, tint(palette, done, 0.25 + 0.75 * done));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = surface;
    strokeTick(ctx, cx, cy, row.h * 0.3, done);
  });
};

const drawRoadmap = (scene: Scene): void => {
  const { dc, box, surface, faint, ink, muted, small, area } = scene;
  const { ctx, progress, time, palette } = dc;
  const strip = box(0, 0.86, 1, 0.14);
  const startX = strip.x + strip.w * 0.08;
  const endX = strip.x + strip.w * 0.74;
  const y = strip.y + strip.h * 0.38;
  const lineP = seg(progress, 0.1, 0.95);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX, y);
  ctx.strokeStyle = faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(startX + (endX - startX) * lineP, y);
  ctx.strokeStyle = tint(palette, lineP);
  ctx.stroke();
  STEPS.forEach((label, index) => {
    const x = startX + ((endX - startX) * index) / (STEPS.length - 1);
    const on = seg(lineP, index / 3 - 0.04, index / 3 + 0.04);
    dot(ctx, x, y, area.h * 0.034, surface);
    dot(ctx, x, y, area.h * 0.026, tint(palette, on, 0.35 + 0.65 * on));
    drawLabel(ctx, label, x, y + strip.h * 0.42, small, on > 0.5 ? ink : muted, "center", on > 0.5);
  });
  const pulse = ((time % PULSE_MS) / PULSE_MS) * lineP * progress;
  dot(
    ctx,
    startX + (endX - startX) * pulse,
    y,
    area.h * 0.014,
    rgba(palette.accentGlow, 0.9 * progress)
  );
  const chipW = strip.w * 0.2;
  const chip = {
    x: strip.x + strip.w - chipW - 2,
    y: strip.y + strip.h * 0.12,
    w: chipW,
    h: strip.h * 0.62,
  };
  fillRounded(ctx, chip, chip.h / 2, tint(palette, progress, 0.18 + 0.2 * progress));
  roundedRectPath(ctx, chip, chip.h / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.5 + 0.5 * progress);
  ctx.stroke();
  drawLabel(
    ctx,
    "48h delivery",
    chip.x + chip.w / 2,
    chip.y + chip.h / 2,
    small,
    ink,
    "center",
    true
  );
};

export const drawIllusHandover = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawPages(scene);
  drawKpis(scene);
  drawCharts(scene);
  drawFindings(scene);
  drawRoadmap(scene);
};
