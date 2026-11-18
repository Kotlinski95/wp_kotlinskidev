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

const FALLBACK_LABELS = ["LCP", "INP", "CLS"] as const;
const TARGET_FRACTIONS = [0.3, 0.26, 0.2] as const;
const GOOD_END = 0.4;
const WARN_END = 0.7;
const GAUGE_START = Math.PI * 0.8;
const GAUGE_SWEEP = Math.PI * 1.4;
const THRESHOLDS = ["good  <= 2.5s", "good  <= 200ms", "good  <= 0.1"] as const;
const SCORES: ReadonlyArray<readonly [string, number]> = [
  ["Performance", 0.52],
  ["Accessibility", 0.7],
  ["Best Practices", 0.8],
  ["SEO", 0.74],
];
const BARS = [
  0.4, 0.55, 0.5, 0.62, 0.58, 0.7, 0.66, 0.78, 0.72, 0.84, 0.8, 0.9, 0.86, 0.95,
] as const;
const SPLIT = 7;
const FORMATTERS: ReadonlyArray<(value: number) => string> = [
  (value) => `${(1.8 * value).toFixed(1)}s`,
  (value) => `${Math.round(120 * value)}ms`,
  (value) => (0.04 * value).toFixed(2),
];

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

export const drawIllusVitals = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitFullArea(width, height);
  const box = (u: number, v: number, w: number, h: number): Rect => ({
    x: area.x + u * area.w,
    y: area.y + v * area.h,
    w: w * area.w,
    h: h * area.h,
  });
  const faint = rgba(palette.muted, 0.2);
  const ink = rgba(palette.strong, 0.85);
  const quiet = rgba(palette.strong, 0.6);
  const surface = rgba(palette.surface, 1);
  const outline = rgba(palette.line, 0.9);
  const text = area.h * 0.028;
  const small = area.h * 0.023;
  const live = progress >= 1;

  const panelFrame = (rect: Rect): void => {
    fillRounded(ctx, rect, 8, surface);
    roundedRectPath(ctx, rect, 8);
    ctx.lineWidth = 1;
    ctx.strokeStyle = outline;
    ctx.stroke();
  };

  for (let index = 0; index < FORMATTERS.length; index += 1) {
    const card = box(index / 3 + 0.005, 0, 1 / 3 - 0.01, 0.42);
    panelFrame(card);
    const grow = easeOutCubic(seg(progress, index * 0.1, index * 0.1 + 0.6));
    const cx = card.x + card.w / 2;
    const cy = card.y + card.h * 0.52;
    const radius = Math.min(card.w * 0.32, card.h * 0.3);

    drawLabel(
      ctx,
      labels[index] || FALLBACK_LABELS[index],
      cx,
      card.y + card.h * 0.1,
      text,
      ink,
      "center",
      true
    );

    ctx.lineCap = "butt";
    ctx.lineWidth = radius * 0.14;
    const zones: ReadonlyArray<readonly [number, number, number]> = [
      [0, GOOD_END, 0.8],
      [GOOD_END, WARN_END, 0.45],
      [WARN_END, 1, 0.2],
    ];
    zones.forEach(([from, to, alpha]) => {
      ctx.strokeStyle = rgba(palette.line, alpha);
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        radius,
        GAUGE_START + GAUGE_SWEEP * from + 0.03,
        GAUGE_START + GAUGE_SWEEP * to - 0.03
      );
      ctx.stroke();
    });
    ctx.lineCap = "round";
    const valueEnd = GAUGE_START + GAUGE_SWEEP * TARGET_FRACTIONS[index] * grow;
    if (grow > 0) {
      ctx.lineWidth = radius * 0.2;
      ctx.strokeStyle = tint(palette, grow);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, GAUGE_START, valueEnd);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = quiet;
    [GOOD_END, WARN_END].forEach((at) => {
      const angle = GAUGE_START + GAUGE_SWEEP * at;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * radius * 1.16, cy + Math.sin(angle) * radius * 1.16);
      ctx.lineTo(cx + Math.cos(angle) * radius * 1.3, cy + Math.sin(angle) * radius * 1.3);
      ctx.stroke();
    });
    const pointerPulse = live ? 1 + 0.18 * Math.sin(time / 500 + index) : 1;
    dot(
      ctx,
      cx + Math.cos(valueEnd) * radius,
      cy + Math.sin(valueEnd) * radius,
      radius * 0.1 * pointerPulse,
      surface
    );
    circlePath(
      ctx,
      cx + Math.cos(valueEnd) * radius,
      cy + Math.sin(valueEnd) * radius,
      radius * 0.1 * pointerPulse
    );
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = tint(palette, grow);
    ctx.stroke();

    drawLabel(
      ctx,
      FORMATTERS[index](grow),
      cx,
      cy - radius * 0.1,
      radius * 0.4,
      tint(palette, grow, 0.6 + 0.4 * grow),
      "center",
      true
    );

    const pass = seg(progress, 0.35 + index * 0.15, 0.55 + index * 0.15);
    const pillW = radius * 1.2;
    const pillH = radius * 0.3;
    const pillX = cx - pillW / 2;
    const pillY = cy + radius * 0.55;
    pill(ctx, pillX, pillY, pillW, pillH, faint);
    pill(ctx, pillX, pillY, pillW, pillH, rgba(palette.accent, 0.22 * pass));
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = tint(palette, pass);
    strokeTick(ctx, pillX + pillH * 0.9, pillY + pillH * 0.5, pillH * 0.5, pass);
    drawLabel(
      ctx,
      "Good",
      pillX + pillW * 0.58,
      pillY + pillH / 2,
      small * 0.9,
      tint(palette, pass),
      "center",
      true
    );
    drawLabel(ctx, THRESHOLDS[index], cx, card.y + card.h * 0.93, small * 0.9, quiet, "center");
  }

  const scores = box(0.005, 0.45, 0.99, 0.285);
  panelFrame(scores);
  const slotW = scores.w / SCORES.length;
  SCORES.forEach(([name, from], index) => {
    const grow = easeOutCubic(seg(progress, 0.15 + index * 0.1, 0.75 + index * 0.1));
    const cx = scores.x + slotW * (index + 0.5);
    const cy = scores.y + scores.h * 0.42;
    const r = Math.min(scores.h * 0.3, slotW * 0.26);
    const fraction = from + (1 - from) * grow;
    ctx.lineCap = "round";
    ctx.lineWidth = r * 0.22;
    circlePath(ctx, cx, cy, r);
    ctx.strokeStyle = rgba(palette.line, 0.8);
    ctx.stroke();
    if (grow > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
      ctx.strokeStyle = tint(palette, grow);
      ctx.stroke();
    }
    drawLabel(
      ctx,
      String(Math.round(fraction * 100)),
      cx,
      cy,
      r * 0.6,
      tint(palette, grow, 0.6 + 0.4 * grow),
      "center",
      true
    );
    drawLabel(ctx, name, cx, scores.y + scores.h * 0.86, small, quiet, "center");
  });

  const chart = box(0.005, 0.76, 0.99, 0.24);
  panelFrame(chart);
  drawLabel(ctx, "Load time", chart.x + chart.w * 0.04, chart.y + chart.h * 0.15, small, quiet);
  const gain = seg(progress, 0.5, 0.95);
  ctx.globalAlpha = gain;
  drawLabel(
    ctx,
    "-62% LCP",
    chart.x + chart.w * 0.96,
    chart.y + chart.h * 0.15,
    small,
    tint(palette, 1),
    "right",
    true
  );
  ctx.globalAlpha = 1;
  const baseY = chart.y + chart.h * 0.9;
  const chartH = chart.h * 0.55;
  const left = chart.x + chart.w * 0.04;
  const slot = (chart.w * 0.92) / BARS.length;
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.line, 0.9);
  ctx.beginPath();
  ctx.moveTo(left, baseY);
  ctx.lineTo(left + slot * BARS.length, baseY);
  ctx.stroke();
  const tops: number[] = [];
  BARS.forEach((value, index) => {
    const grown = easeOutCubic(seg(progress, 0.05 + index * 0.04, 0.45 + index * 0.04));
    const barH = chartH * value * (0.15 + 0.85 * grown);
    const after = index >= SPLIT;
    tops.push(baseY - barH);
    fillRounded(
      ctx,
      { x: left + index * slot + slot * 0.15, y: baseY - barH, w: slot * 0.7, h: barH },
      Math.min(3, slot * 0.2),
      after ? tint(palette, grown, 0.3 + 0.7 * grown) : rgba(palette.muted, 0.25 + 0.2 * grown)
    );
  });

  const trace = seg(progress, 0.3, 0.95) * (BARS.length - 1);
  if (trace > 0) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = tint(palette, 1);
    ctx.beginPath();
    const whole = Math.floor(trace);
    let endX = left + slot * 0.5;
    let endY = tops[0] - 4;
    ctx.moveTo(endX, endY);
    for (let index = 1; index <= whole + 1 && index < BARS.length; index += 1) {
      const t = index <= whole ? 1 : trace - whole;
      const px = left + slot * (index - 1 + 0.5);
      const py = tops[index - 1] - 4;
      const nx = left + slot * (index + 0.5);
      const ny = tops[index] - 4;
      endX = px + (nx - px) * t;
      endY = py + (ny - py) * t;
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();
    dot(ctx, endX, endY, 3 + (live ? Math.sin(time / 400) : 0), tint(palette, 1));
  }

  const markX = left + slot * SPLIT;
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = quiet;
  ctx.beginPath();
  ctx.moveTo(markX, chart.y + chart.h * 0.26);
  ctx.lineTo(markX, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, "Before", markX - 6, chart.y + chart.h * 0.3, small * 0.95, quiet, "right");
  drawLabel(
    ctx,
    "After",
    markX + 6,
    chart.y + chart.h * 0.3,
    small * 0.95,
    tint(palette, gain),
    "left",
    true
  );
};
